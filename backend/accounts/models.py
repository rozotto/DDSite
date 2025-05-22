from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, first_name='', last_name=''):
        if not email:
            raise ValueError("The Email field must be set")
        user = self.model(email=self.normalize_email(email), first_name=first_name, last_name=last_name)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, first_name='', last_name=''):
        user = self.create_user(email, password, first_name, last_name)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class CustomUser(AbstractBaseUser):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100, default='Имя')
    last_name = models.CharField(max_length=100, default='Фамилия')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    profile_photo = models.ImageField(upload_to="profile_photos/", blank=True, null=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

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


class AssignmentSection(models.Model):
    title = models.CharField(max_length=255, verbose_name="Название раздела")
    order = models.PositiveIntegerField(default=0, verbose_name="Порядок сортировки")
    
    class Meta:
        ordering = ['order']
        verbose_name = "Раздел заданий"
        verbose_name_plural = "Разделы заданий"
    
    def __str__(self):
        return self.title


class Assignment(models.Model):
    section = models.ForeignKey(AssignmentSection, on_delete=models.CASCADE, related_name='assignments')
    question = models.CharField(max_length=1000, verbose_name="Вопрос")
    image = models.ImageField(upload_to='assignments_images/', null=True, blank=True, verbose_name="Изображение")
    answer = models.TextField(verbose_name="Ответ")
    solution = models.TextField(verbose_name="Решение", blank=True, null=True)
    order = models.PositiveIntegerField(default=0, verbose_name="Порядок сортировки")
    
    class Meta:
        ordering = ['order']
        verbose_name = "Задание"
        verbose_name_plural = "Задания"
    
    def __str__(self):
        return f"{self.section.title} - {self.question[:50]}"


class HomeworkAssignment(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.lesson.title} — {self.assignment.question}'


class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=False)
    cover_image = models.ImageField(upload_to='course_covers/', null=True, blank=True)

    def __str__(self):
        return self.title


class CourseLesson(models.Model):
    course = models.ForeignKey(Course, related_name='lessons', on_delete=models.CASCADE)
    lesson = models.ForeignKey('Lesson', on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        unique_together = ['course', 'lesson']

    def __str__(self):
        return f"{self.course.title} - {self.lesson.title} (Order: {self.order})"