from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager


class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None):
        if not email:
            raise ValueError("The Email field must be set")
        user = self.model(username=username, email=self.normalize_email(email))
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None):
        user = self.create_user(username, email, password)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class CustomUser(AbstractBaseUser):
    username = models.CharField(max_length=255, unique=True)
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    profile_photo = models.ImageField(
        upload_to="profile_photos/", blank=True, null=True
    )

    objects = CustomUserManager()

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]

    def __str__(self):
        return self.username

    def has_perm(self, a):
        return self.is_superuser

    def has_module_perms(self, a):
        return self.is_superuser


class TutorStudent(models.Model):
    tutor = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='tutors')
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='students')
    date_assigned = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('tutor', 'student')


class Lesson(models.Model):
    tutor = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class LessonMaterial(models.Model):
    lesson = models.ForeignKey(Lesson, related_name='materials', on_delete=models.CASCADE)
    file = models.FileField(upload_to='lesson_materials/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.lesson.title} - {self.file.name}"


class Assignment(models.Model):
    question = models.CharField(max_length=1000)
    image = models.ImageField(upload_to='assignments_images/', null=True, blank=True)
    answer = models.TextField()

    def __str__(self):
        return self.question


class HomeworkAssignment(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.lesson.title} — {self.assignment.question}'
