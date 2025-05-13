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
    path('api/add_lesson/', views.add_lesson, name='add_lesson'),
    path('api/complete_lessons/', views.get_lessons, name='get_lessons'),
    path('api/lessons/<int:lesson_id>/', views.get_lesson_details, name='get_lesson_details'),
    path('api/lessons/<int:lesson_id>/upload_files/', views.upload_lesson_material, name='upload_lesson_file'),
    path('api/lessons/<int:lesson_id>/files/', views.get_lesson_files, name='lesson-files'),
    path('api/assignments/', views.get_assignments, name='assignments-list'),
    path('api/assignments/<int:assignment_id>/', views.assignment_get, name='assignment-detail'),
    path('api/lessons/<int:lesson_id>/homework/', views.lesson_assignments),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)