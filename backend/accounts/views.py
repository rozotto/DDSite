from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.core.files.storage import default_storage
from .models import CustomUser, Course, Enrollment
import json
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from .serializers import CourseSerializer


@csrf_exempt
def register(request):
    if request.method == 'POST':
        try:
            username = request.POST.get('username')
            email = request.POST.get('email')
            password = request.POST.get('password')
            password2 = request.POST.get('password2')
            profile_photo = request.FILES.get('profile_photo')

            if not all([username, email, password, password2, profile_photo]):
                return JsonResponse({'error': 'All fields are required'}, status=400)

            if password != password2:
                return JsonResponse({'error': 'Passwords do not match'}, status=400)

            if CustomUser.objects.filter(username=username).exists():
                return JsonResponse({'error': 'Username already taken'}, status=400)

            profile_photo_path = None
            if profile_photo:
                profile_photo_path = default_storage.save(f'profile_photos/{profile_photo.name}', profile_photo)

            user = CustomUser.objects.create_user(
                username=username,
                email=email,
                password=password,
            )
            if profile_photo_path:
                user.profile_photo = profile_photo_path
            user.save()

            return JsonResponse({'message': 'User registered successfully'}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
    else:
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)


@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')

            if not username or not password:
                return JsonResponse({'error': 'Username and password are required'}, status=400)

            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user)

                response_data = {
                    'userid': user.id,
                }
                return JsonResponse(response_data, status=200)

            else:
                return JsonResponse({'error': 'Invalid credentials'}, status=401)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
    else:
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)


@csrf_exempt
def profile_view(request):
    userid = request.GET.get('userid')
    if not userid:
        return JsonResponse({'error': 'userid is required'}, status=400)

    user = get_object_or_404(CustomUser, id=userid)

    profile_photo_url = (
        request.build_absolute_uri(user.profile_photo.url)
        if user.profile_photo
        else None
    )

    data = {
        'username': user.username,
        'email': user.email,
        'password': user.password,
        'profile_photo': profile_photo_url,
    }
    return JsonResponse(data, status=200)


@csrf_exempt
def create_course(request):
    if request.method == 'POST':
        try:
            body = request.body.decode('utf-8')
            data = json.loads(body)
            course = Course.objects.create(
                title=data.get('title'),
                description=data.get('description'),
                tags=data.get('tags'),
                content=data.get('content'),
                author=request.user if request.user.is_authenticated else None
            )
            course.save()
            return JsonResponse({"message": "Course created successfully"}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request method"}, status=405)


@login_required
def enroll_course(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    if Enrollment.objects.filter(course=course, user=request.user).exists():
        return JsonResponse({'error': 'You are already enrolled in this course'}, status=400)

    Enrollment.objects.create(course=course, user=request.user)
    return JsonResponse({'message': f'You have successfully enrolled in {course.title}'}, status=200)


def courses_list(request):
    courses = Course.objects.all().values('id', 'title', 'description', 'tags', 'content')
    return JsonResponse(list(courses), safe=False, status=200)


def course_detail(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    return JsonResponse({
        'id': course.id,
        'title': course.title,
        'description': course.description,
        'tags': course.tags,
        'content': course.content,
    }, status=200)
