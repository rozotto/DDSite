from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("api/register/", views.register, name="register"),
    path("api/login/", views.login_view, name="login"),
    path("api/profile/", views.profile_view, name="profile_view"),
    path("api/users/<int:user_id>/edit/", views.edit_user, name="edit_user"),
    path("api/delete_user/<int:user_id>/", views.delete_user, name="delete_user"),
    path('api/students/', views.get_all_students, name='get_all_students'),
    path('api/assign_student/', views.assign_student, name='assign_student'),
    path('api/all_selected_students/', views.all_selected_students, name='all_selected_students'),
    path('api/add_lesson/', views.add_lesson, name='add_lesson'),
    path('api/complete_lessons/', views.get_lessons, name='get_lessons'),
    path('api/assignment_sections/', views.assignment_sections, name='assignment-sections'),
    path('api/section_assignments/<int:section_id>/', views.section_assignments, name='section-assignments'),
    path('api/assignment/<int:assignment_id>/', views.assignment_detail, name='assignment-detail'),
    path('api/lessons/<int:lesson_id>/', views.get_lesson_details, name='lesson-details'),
    path('api/lessons/<int:lesson_id>/upload_files/', views.upload_lesson_material, name='upload-lesson-material'),
    path('api/assignment_sections/', views.get_assignment_sections, name='assignment-sections'),
    path('api/section_assignments/<int:section_id>/', views.get_section_assignments, name='section-assignments'),
    path('api/lessons/<int:lesson_id>/homework/', views.lesson_homework, name='lesson-homework'),
    path('api/courses/', views.course_list),
    path('api/courses/<int:course_id>/', views.course_detail),
    path('api/courses/<int:course_id>/lessons/', views.add_lesson_to_course),
    path('api/courses/<int:course_id>/lessons/<int:lesson_id>/', views.remove_lesson_from_course),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)