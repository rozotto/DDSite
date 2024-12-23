from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.register, name="register"),
    path("login/", views.login_view, name="login"),
    path("api/profile/", views.profile_view, name="profile_view"),
    path("courses/", views.courses_list, name="courses_list"),
    path("course/<int:course_id>/", views.course_detail, name="course_detail"),
    path("courses/create/", views.create_course, name="create_course"),
    path("courses/<int:course_id>/enroll/", views.enroll_course, name="enroll_course"),
    path(
        "user/<int:user_id>/courses/",
        views.user_enrolled_courses,
        name="user_enrolled_courses",
    ),
]
