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


@method_decorator(csrf_exempt, name='dispatch')
@login_required
def create_course(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            title = data.get('title')
            description = data.get('description')
            duration = data.get('duration')
            max_participants = data.get('max_participants')

            if not title or not description or not duration or not max_participants:
                return JsonResponse({'error': 'All fields are required'}, status=400)

            course = Course.objects.create(
                title=title,
                description=description,
                duration=duration,
                max_participants=max_participants
            )
            return JsonResponse({'message': 'Course created successfully', 'course': {
                'id': course.id,
                'title': course.title,
                'description': course.description,
                'duration': course.duration,
                'max_participants': course.max_participants,
            }}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=405)


@login_required
def enroll_course(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    if Enrollment.objects.filter(course=course, user=request.user).exists():
        return JsonResponse({'error': 'You are already enrolled in this course'}, status=400)
    if course.enrollments.count() >= course.max_participants:
        return JsonResponse({'error': 'The course is already full'}, status=400)

    Enrollment.objects.create(course=course, user=request.user)
    return JsonResponse({'message': f'You have successfully enrolled in {course.title}'}, status=200)


@login_required
def courses_list(request):
    courses = Course.objects.all().values('id', 'title', 'description', 'duration', 'max_participants')
    return JsonResponse(list(courses), safe=False, status=200)


def course_detail(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    return JsonResponse({
        'id': course.id,
        'title': course.title,
        'description': course.description,
        'duration': course.duration,
        'max_participants': course.max_participants,
    }, status=200)


def courses_list_api(request):
    if request.method == 'GET':
        courses = CourseSerializer.objects.all()
        courses_data = list(courses.values())  # Преобразуем QuerySet в список словарей
        return JsonResponse(courses_data, safe=False)  # safe=False позволяет вернуть массив JSON


def course_detail_api(request, course_id):
    if request.method == 'GET':
        try:
            course = CourseSerializer.objects.get(id=course_id)
            course_data = {
                'id': course.id,
                'name': course.name,
                'description': course.description,
                'created_at': course.created_at,
                'updated_at': course.updated_at,
            }  # Сериализуем вручную, указывая нужные поля
            return JsonResponse(course_data)
        except Course.DoesNotExist:
            return JsonResponse({'error': 'Course not found'}, status=404)
