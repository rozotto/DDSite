from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
    path('api/profile/', views.profile_view, name='profile_view'),
    path('courses/', views.courses_list, name='courses_list'),
    path('course/<int:course_id>/', views.course_detail, name='course_detail'),
    path('courses/create/', views.create_course, name='create_course'),
    path('courses/<int:course_id>/enroll/', views.enroll_course, name='enroll_course'),
    path('api/courses/', views.courses_list_api, name='courses_list_api'),
    path('api/courses/<int:course_id>/', views.course_detail_api, name='course_detail_api')
]
