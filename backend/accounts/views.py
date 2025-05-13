from django.contrib.auth import authenticate, login, get_user_model
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from .models import CustomUser, TutorStudent, Lesson, LessonMaterial, Assignment, HomeworkAssignment
import json
import os


@csrf_exempt
def register(request):
    if request.method == "POST":
        try:
            username = request.POST.get("username")
            email = request.POST.get("email")
            password = request.POST.get("password")
            password2 = request.POST.get("password2")

            if not all([username, email, password, password2]):
                return JsonResponse({"error": "All fields are required"}, status=400)

            if password != password2:
                return JsonResponse({"error": "Passwords do not match"}, status=400)

            if CustomUser.objects.filter(username=username).exists():
                return JsonResponse({"error": "Username already taken"}, status=400)

            user = CustomUser.objects.create_user(
                username=username,
                email=email,
                password=password,
            )

            return JsonResponse({"message": "User registered successfully"}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
    else:
        return JsonResponse({"error": "Only POST method is allowed"}, status=405)


@csrf_exempt
def login_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")

            if not username or not password:
                return JsonResponse(
                    {"error": "Username and password are required"}, status=400
                )

            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user)

                response_data = {
                    "userid": user.id,
                }
                return JsonResponse(response_data, status=200)

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
        "username": user.username,
        "email": user.email,
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
                user.username = data.get("username", user.username)
                user.email = data.get("email", user.email)

            elif request.content_type.startswith("multipart/form-data"):
                user.username = request.POST.get("username", user.username)
                user.email = request.POST.get("email", user.email)
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
            'username': student.username,
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


def get_lesson_details(request, lesson_id):
    if request.method == 'GET':
        lesson = get_object_or_404(Lesson, id=lesson_id)
        materials = LessonMaterial.objects.filter(lesson=lesson)
        files = [{"name": m.file.name, "url": m.file.url} for m in materials]
        return JsonResponse({
            "id": lesson.id,
            "title": lesson.title,
            "description": lesson.description,
            "files": files
        })


@csrf_exempt
def upload_lesson_material(request, lesson_id):
    if request.method == "POST":
        try:
            if "file" not in request.FILES:
                return JsonResponse({"error": "Файл не найден в запросе"}, status=400)

            lesson = get_object_or_404(Lesson, id=lesson_id)
            uploaded_file = request.FILES["file"]

            LessonMaterial.objects.create(lesson=lesson, file=uploaded_file)

            return JsonResponse({"status": "success", "message": "Файл успешно загружен"}, status=201)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Метод не поддерживается"}, status=405)


def get_lesson_files(request, lesson_id):
    try:
        lesson = Lesson.objects.get(id=lesson_id)

        materials = LessonMaterial.objects.filter(lesson=lesson).order_by('-uploaded_at')

        files_data = []
        for material in materials:
            files_data.append({
                'id': material.id,
                'filename': os.path.basename(material.file.name),
                'url': material.file.url,
                'uploaded_at': material.uploaded_at.strftime("%Y-%m-%d %H:%M:%S"),
                'size': material.file.size
            })


        return JsonResponse({
            'status': 'success',
            'lesson_title': lesson.title,
            'lesson_description': lesson.description,
            'materials': files_data,
            'materials_count': len(files_data)
        })

    except Lesson.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Lesson not found'}, status=404)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


@csrf_exempt
def get_assignments(request):
    if request.method == 'GET':
        assignments = Assignment.objects.all().values('id', 'question', 'image', 'answer')
        assignments_list = list(assignments)

        return JsonResponse({
            'status': 'success',
            'assignments': assignments_list,
            'assignments_count': len(assignments_list)
        })

    elif request.method == 'POST':
        # Получение данных из запроса
        question = request.POST.get('question')
        answer = request.POST.get('answer')
        image = request.FILES.get('image')

        if not question or not answer:
            return JsonResponse({'status': 'error', 'message': 'Отсутствуют обязательные поля'}, status=400)

        try:
            # Создаем задание
            assignment = Assignment.objects.create(
                question=question,
                answer=answer,
                image=image
            )

            return JsonResponse({
                'status': 'success',
                'message': 'Задание успешно добавлено',
                'assignment_id': assignment.id
            }, status=201)

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Метод не поддерживается'}, status=405)


@csrf_exempt
def assignment_get(request, assignment_id):
    try:
        assignment = Assignment.objects.get(id=assignment_id)

        if request.method == 'GET':
            assignment_data = {
                'id': assignment.id,
                'question': assignment.question,
                'answer': assignment.answer,
                'image': assignment.image.url if assignment.image else None,
            }
            return JsonResponse({
                'status': 'success',
                'assignment': assignment_data
            })

        elif request.method == 'PUT':
            # Обновление задания
            question = request.POST.get('question')
            answer = request.POST.get('answer')
            image = request.FILES.get('image')

            if question:
                assignment.question = question
            if answer:
                assignment.answer = answer
            if image:
                assignment.image = image

            assignment.save()

            return JsonResponse({
                'status': 'success',
                'message': 'Задание обновлено'
            })

        elif request.method == 'DELETE':
            assignment.delete()
            return JsonResponse({
                'status': 'success',
                'message': 'Задание удалено'
            })

        return JsonResponse({'status': 'error', 'message': 'Метод не поддерживается'}, status=405)

    except Assignment.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Задание не найдено'}, status=404)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


@csrf_exempt
def lesson_assignments(request, lesson_id):
    if request.method == 'GET':
        links = HomeworkAssignment.objects.filter(lesson_id=lesson_id).select_related('assignment')
        data = [{
            'id': link.assignment.id,
            'question': link.assignment.question,
            'answer': link.assignment.answer,
            'image': link.assignment.image.url if link.assignment.image else None,
        } for link in links]

        return JsonResponse({'status': 'success', 'assignments': data})

    elif request.method == 'POST':
        try:
            body = json.loads(request.body)
            assignment_ids = body.get('assignment_ids', [])

            for assignment_id in assignment_ids:
                HomeworkAssignment.objects.get_or_create(
                    lesson_id=lesson_id,
                    assignment_id=assignment_id
                )

            return JsonResponse({'status': 'success', 'message': 'Домашнее задание составлено'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

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
                    'image': a.image.url if a.image else None
                }
                for a in assignments
            ]
            return JsonResponse({'status': 'success', 'assignments': assignments_data})

        elif request.method == 'POST':
            data = json.loads(request.body)
            assignment_ids = data.get('assignment_ids', [])
            assignments = Assignment.objects.filter(id__in=assignment_ids)
            lesson.homework.set(assignments)
            return JsonResponse({'status': 'success', 'message': 'Домашнее задание составлено'})

        return JsonResponse({'status': 'error', 'message': 'Метод не поддерживается'}, status=405)

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
