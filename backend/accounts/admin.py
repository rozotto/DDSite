from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    readonly_fields = ("date_joined",)

    list_display = ("email", "first_name", "last_name", "profile_photo_tag", "is_staff", "is_active")
    list_filter = ("is_staff", "is_active")

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("first_name", "last_name", "profile_photo")}),
        ("Permissions", {"fields": ("is_staff", "is_active", "is_superuser")}),
        ("Important Dates", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "first_name",
                    "last_name",
                    "profile_photo",
                    "password1",
                    "password2",
                    "is_staff",
                    "is_active",
                    "is_superuser",
                ),
            },
        ),
    )

    search_fields = ("email", "first_name", "last_name")
    ordering = ("email",)
    filter_horizontal = ()

    def profile_photo_tag(self, obj):
        if obj.profile_photo:
            return format_html(
                f'<img src="{obj.profile_photo.url}" style="width: 50px; height: 50px; border-radius: 25px;" />'
            )
        return "No Image"

    profile_photo_tag.short_description = "Фото профиля"
