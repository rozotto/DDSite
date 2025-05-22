from django.contrib.auth import authenticate, login, get_user_model
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from .models import CustomUser, TutorStudent, Lesson, LessonMaterial, AssignmentSection, Assignment, HomeworkAssignment, Course, CourseLesson
from django.db import models
import json
import os


@csrf_exempt
def register(request):
    if request.method == "POST":
        try:
            email = request.POST.get("email")
            password = request.POST.get("password")
            password2 = request.POST.get("password2")
            first_name = request.POST.get("first_name")
            last_name = request.POST.get("last_name")

            if not all([email, password, password2, first_name, last_name]):
                return JsonResponse({"error": "All fields are required"}, status=400)

            if password != password2:
                return JsonResponse({"error": "Passwords do not match"}, status=400)

            if CustomUser.objects.filter(email=email).exists():
                return JsonResponse({"error": "Email already taken"}, status=400)

            user = CustomUser.objects.create_user(
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )

            return JsonResponse({"message": "User registered successfully"}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    else:
        return JsonResponse({"error": "Only POST method is allowed"}, status=405)


@csrf_exempt
def login_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            password = data.get("password")

            if not email or not password:
                return JsonResponse(
                    {"error": "Email and password are required"}, status=400
                )

            user = authenticate(request, username=email, password=password)

            if user is not None:
                login(request, user)
                return JsonResponse({"userid": user.id}, status=200)
            else:
                return JsonResponse({"error": "Invalid credentials"}, status=401)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
    else:
        return JsonResponse({"error": "Only POST method is allowed"}, status=405)


@csrf_exempt
def profile_view(request):
    userid = request.GET.get("userid")
    if not userid:
        return JsonResponse({"error": "userid is required"}, status=400)

    user = get_object_or_404(CustomUser, id=userid)

    profile_photo_url = (
        request.build_absolute_uri(user.profile_photo.url)
        if user.profile_photo
        else None
    )

    data = {
        "id": user.id,
        "is_staff": user.is_staff,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "profile_photo": profile_photo_url,
    }
    return JsonResponse(data, status=200)


User = get_user_model()


@csrf_exempt
def edit_user(request, user_id):
    if request.method in ["POST", "PUT"]:
        try:
            user = get_object_or_404(CustomUser, id=user_id)

            if request.content_type == "application/json":
                data = json.loads(request.body.decode("utf-8"))
                user.email = data.get("email", user.email)
                user.first_name = data.get("first_name", user.first_name)
                user.last_name = data.get("last_name", user.last_name)

            elif request.content_type.startswith("multipart/form-data"):
                user.email = request.POST.get("email", user.email)
                user.first_name = request.POST.get("first_name", user.first_name)
                user.last_name = request.POST.get("last_name", user.last_name)
                if "profile_photos" in request.FILES:
                    user.profile_photo = request.FILES["profile_photos"]

            user.save()

            return JsonResponse(
                {
                    "status": "success",
                    "message": "User updated successfully",
                    "user_id": user.id,
                }
            )

        except json.JSONDecodeError:
            return JsonResponse(
                {
                    "status": "error",
                    "message": "Invalid JSON payload",
                    "status_code": 400,
                },
                status=400,
            )

        except Exception as e:
            return JsonResponse(
                {"status": "error", "message": str(e), "status_code": 500}, status=500
            )

    return JsonResponse(
        {
            "status": "error",
            "message": f"{request.method} method not allowed",
            "status_code": 405,
        },
        status=405,
    )


@csrf_exempt
def delete_user(request, user_id):
    if request.method == "DELETE":
        try:
            user = User.objects.get(id=user_id)
            user.delete()
            return JsonResponse(
                {"message": "Пользователь успешно удалён."},
                status=200,
                json_dumps_params={"ensure_ascii": False},
            )
        except User.DoesNotExist:
            return JsonResponse(
                {"error": "Пользователь не найден."},
                status=404,
                json_dumps_params={"ensure_ascii": False},
            )
    return JsonResponse(
        {"error": "Метод запроса должен быть DELETE."},
        status=400,
        json_dumps_params={"ensure_ascii": False},
    )


@csrf_exempt
def get_all_students(request):
    tutor_id = request.GET.get('tutor_id')
    students = CustomUser.objects.filter(is_staff=False)

    result = []
    for student in students:
        is_selected = False
        if tutor_id:
            is_selected = TutorStudent.objects.filter(
                tutor_id=tutor_id,
                student_id=student.id
            ).exists()

        result.append({
            'id': student.id,
            'email': student.email,
            'profile_photo': student.profile_photo.url if student.profile_photo else None,
            'isSelected': is_selected
        })

    return JsonResponse({'students': result})


@csrf_exempt
def assign_student(request):
    try:
        data = json.loads(request.body)
        student_id = data.get('student_id')
        tutor_id = data.get('tutor_id')
        is_selected = data.get('is_selected')

        student = CustomUser.objects.get(id=student_id)
        tutor = CustomUser.objects.get(id=tutor_id)

        if is_selected:
            TutorStudent.objects.create(tutor=tutor, student=student)
        else:
            TutorStudent.objects.filter(tutor=tutor, student=student).delete()

        return JsonResponse({'status': 'success'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
def all_selected_students(request):
    try:
        selected_students = TutorStudent.objects.all().values_list('student_id', flat=True)
        return JsonResponse({'selected_students': list(selected_students)})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
def add_lesson(request):
    if request.method == "POST":
        try:
            body = request.body.decode("utf-8")
            data = json.loads(body)

            title = data.get("title")
            description = data.get("description")

            if not title:
                return JsonResponse({"error": "Title is required"}, status=400)

            lesson = Lesson.objects.create(
                tutor=request.user if request.user.is_authenticated else User.objects.first(),
                title=title,
                description=description
            )

            return JsonResponse({"status": "success", "lesson_id": lesson.id})

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)


def get_lessons(request):
    if request.method == "GET":
        lessons = Lesson.objects.all().values('id', 'title', 'description')
        return JsonResponse(list(lessons), safe=False)
    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def assignment_sections(request):
    if request.method == 'GET':
        sections = AssignmentSection.objects.all().order_by('order')
        sections_list = [{
            'id': section.id,
            'title': section.title,
            'order': section.order
        } for section in sections]
        
        return JsonResponse({
            'status': 'success',
            'sections': sections_list
        })
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            title = data.get('title')
            
            if not title:
                return JsonResponse({'status': 'error', 'message': 'Не указано название раздела'}, status=400)
                
            section = AssignmentSection.objects.create(title=title)
            
            return JsonResponse({
                'status': 'success',
                'section_id': section.id
            }, status=201)
        
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    
    return JsonResponse({'status': 'error', 'message': 'Метод не поддерживается'}, status=405)


@csrf_exempt
def section_assignments(request, section_id):
    try:
        section = AssignmentSection.objects.get(id=section_id)
        
        if request.method == 'GET':
            assignments = section.assignments.all().order_by('order')
            assignments_list = [{
                'id': assignment.id,
                'question': assignment.question,
                'image': assignment.image.url if assignment.image else None,
                'answer': assignment.answer,
                'solution': assignment.solution,
                'order': assignment.order
            } for assignment in assignments]
            
            return JsonResponse({
                'status': 'success',
                'section_title': section.title,
                'assignments': assignments_list
            })
        
        elif request.method == 'POST':
            data = request.POST
            question = data.get('question')
            answer = data.get('answer')
            solution = data.get('solution')
            image = request.FILES.get('image')
            
            if not question or not answer:
                return JsonResponse({'status': 'error', 'message': 'Не указаны обязательные поля'}, status=400)
                
            assignment = Assignment.objects.create(
                section=section,
                question=question,
                answer=answer,
                solution=solution,
                image=image
            )
            
            return JsonResponse({
                'status': 'success',
                'assignment_id': assignment.id
            }, status=201)
    
    except AssignmentSection.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Раздел не найден'}, status=404)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    
    return JsonResponse({'status': 'error', 'message': 'Метод не поддерживается'}, status=405)


@csrf_exempt
def assignment_detail(request, assignment_id):
    try:
        assignment = Assignment.objects.get(id=assignment_id)
        
        if request.method == 'GET':
            return JsonResponse({
                'status': 'success',
                'assignment': {
                    'id': assignment.id,
                    'section_id': assignment.section.id,
                    'section_title': assignment.section.title,
                    'question': assignment.question,
                    'image': assignment.image.url if assignment.image else None,
                    'answer': assignment.answer,
                    'solution': assignment.solution
                }
            })
        
        elif request.method == 'PUT':
            data = request.POST
            assignment.question = data.get('question', assignment.question)
            assignment.answer = data.get('answer', assignment.answer)
            assignment.solution = data.get('solution', assignment.solution)
            
            if 'image' in request.FILES:
                assignment.image = request.FILES['image']
            
            assignment.save()
            
            return JsonResponse({'status': 'success'})
        
        elif request.method == 'DELETE':
            assignment.delete()
            return JsonResponse({'status': 'success'})
    
    except Assignment.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Задание не найден'}, status=404)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    
    return JsonResponse({'status': 'error', 'message': 'Метод не поддерживается'}, status=405)


@csrf_exempt
def get_lesson_details(request, lesson_id):
    if request.method == 'GET':
        try:
            lesson = get_object_or_404(Lesson, id=lesson_id)
            materials = LessonMaterial.objects.filter(lesson=lesson)
            
            homework_assignments = HomeworkAssignment.objects.filter(lesson=lesson)
            attached_assignments = [
                {
                    'id': ha.assignment.id,
                    'question': ha.assignment.question,
                    'answer': ha.assignment.answer,
                    'solution': ha.assignment.solution,
                    'image': request.build_absolute_uri(ha.assignment.image.url) if ha.assignment.image else None,
                    'section_id': ha.assignment.section.id,
                    'section_title': ha.assignment.section.title
                }
                for ha in homework_assignments
            ]
            
            files_data = []
            for material in materials:
                files_data.append({
                    'filename': os.path.basename(material.file.name),
                    'url': request.build_absolute_uri(material.file.url),
                    'uploaded_at': material.uploaded_at.strftime("%Y-%m-%d %H:%M:%S"),
                    'size': material.file.size
                })
            
            return JsonResponse({
                'status': 'success',
                'lesson_title': lesson.title,
                'lesson_description': lesson.description,
                'materials': files_data,
                'attached_assignments': attached_assignments
            })
            
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Метод не поддерживается'}, status=405)


@csrf_exempt
def upload_lesson_material(request, lesson_id):
    if request.method == 'POST':
        try:
            lesson = get_object_or_404(Lesson, id=lesson_id)
            if 'file' not in request.FILES:
                return JsonResponse({'status': 'error', 'message': 'Файл не найден'}, status=400)
                
            uploaded_file = request.FILES['file']
            material = LessonMaterial.objects.create(lesson=lesson, file=uploaded_file)
            
            return JsonResponse({
                'status': 'success',
                'file': {
                    'filename': os.path.basename(material.file.name),
                    'url': request.build_absolute_uri(material.file.url),
                    'uploaded_at': material.uploaded_at.strftime("%Y-%m-%d %H:%M:%S"),
                    'size': material.file.size
                }
            })
            
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Метод не поддерживается'}, status=405)


@csrf_exempt
def get_assignment_sections(request):
    if request.method == 'GET':
        try:
            sections = AssignmentSection.objects.all().order_by('order')
            sections_data = []
            
            for section in sections:
                assignments = section.assignments.all().order_by('order')
                assignments_data = [
                    {
                        'id': a.id,
                        'question': a.question,
                        'answer': a.answer,
                        'solution': a.solution,
                        'image': request.build_absolute_uri(a.image.url) if a.image else None,
                        'order': a.order
                    }
                    for a in assignments
                ]
                
                sections_data.append({
                    'id': section.id,
                    'title': section.title,
                    'order': section.order,
                    'assignments': assignments_data
                })
            
            return JsonResponse({'status': 'success', 'sections': sections_data})
            
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Метод не поддерживается'}, status=405)


@csrf_exempt
def get_section_assignments(request, section_id):
    if request.method == 'GET':
        try:
            section = get_object_or_404(AssignmentSection, id=section_id)
            assignments = section.assignments.all().order_by('order')
            
            assignments_data = [
                {
                    'id': a.id,
                    'question': a.question,
                    'answer': a.answer,
                    'solution': a.solution,
                    'image': request.build_absolute_uri(a.image.url) if a.image else None,
                    'order': a.order
                }
                for a in assignments
            ]
            
            return JsonResponse({
                'status': 'success',
                'section_title': section.title,
                'assignments': assignments_data
            })
            
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Метод не поддерживается'}, status=405)


@csrf_exempt
def lesson_homework(request, lesson_id):
    try:
        lesson = get_object_or_404(Lesson, id=lesson_id)
        
        if request.method == 'GET':
            assignments = lesson.homework.all()
            assignments_data = [
                {
                    'id': a.id,
                    'question': a.question,
                    'answer': a.answer,
                    'solution': a.solution,
                    'image': request.build_absolute_uri(a.image.url) if a.image else None,
                    'section_id': a.section.id,
                    'section_title': a.section.title
                }
                for a in assignments
            ]
            return JsonResponse({'status': 'success', 'assignments': assignments_data})
            
        elif request.method == 'POST':
            data = json.loads(request.body)
            assignment_ids = data.get('assignment_ids', [])
            
            HomeworkAssignment.objects.filter(lesson=lesson).delete()
            
            for assignment_id in assignment_ids:
                assignment = get_object_or_404(Assignment, id=assignment_id)
                HomeworkAssignment.objects.create(lesson=lesson, assignment=assignment)
            
            return JsonResponse({'status': 'success', 'message': 'Задания успешно прикреплены'})
            
        elif request.method == 'DELETE':
            assignment_id = request.GET.get('assignment_id')
            if not assignment_id:
                return JsonResponse({'status': 'error', 'message': 'Не указан assignment_id'}, status=400)
                
            HomeworkAssignment.objects.filter(lesson=lesson, assignment_id=assignment_id).delete()
            return JsonResponse({'status': 'success', 'message': 'Задание успешно откреплено'})
            
        return JsonResponse({'status': 'error', 'message': 'Метод не поддерживается'}, status=405)
        
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


@csrf_exempt
def course_list(request):
    if request.method == 'GET':
        courses = Course.objects.all().values('id', 'title', 'description', 'cover_image')
        return JsonResponse({'status': 'success', 'courses': list(courses)})
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            course = Course.objects.create(
                title=data['title'],
                description=data['description']
            )
            return JsonResponse({
                'status': 'success',
                'course_id': course.id
            }, status=201)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)


@csrf_exempt
def course_detail(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    
    if request.method == 'GET':
        lessons = course.lessons.all().order_by('order').values(
            'id', 
            'lesson__id', 
            'lesson__title',
            'order'
        )
        return JsonResponse({
            'status': 'success',
            'course': {
                'id': course.id,
                'title': course.title,
                'description': course.description,
                'cover_image': course.cover_image.url if course.cover_image else None,
                'lessons': list(lessons)
            }
        })
    
    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
            course.title = data.get('title', course.title)
            course.description = data.get('description', course.description)
            course.is_published = data.get('is_published', course.is_published)
            course.save()
            
            if 'lessons_order' in data:
                for lesson_data in data['lessons_order']:
                    CourseLesson.objects.filter(
                        course=course,
                        lesson_id=lesson_data['lesson_id']
                    ).update(order=lesson_data['order'])
            
            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    
    elif request.method == 'DELETE':
        course.delete()
        return JsonResponse({'status': 'success'})


@csrf_exempt
def add_lesson_to_course(request, course_id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            course = get_object_or_404(Course, id=course_id)
            lesson_id = int(data['lesson_id'])
            
            max_order = CourseLesson.objects.filter(course=course).aggregate(models.Max('order'))['order__max'] or 0
            
            CourseLesson.objects.create(
                course=course,
                lesson_id=lesson_id,
                order=max_order + 1
            )
            
            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)


@csrf_exempt
def remove_lesson_from_course(request, course_id, lesson_id):
    if request.method == 'DELETE':
        try:
            course_lesson = get_object_or_404(
                CourseLesson,
                course_id=course_id,
                lesson_id=lesson_id
            )
            course_lesson.delete()
            
            lessons = CourseLesson.objects.filter(course_id=course_id).order_by('order')
            for index, lesson in enumerate(lessons, start=1):
                lesson.order = index
                lesson.save()
            
            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)