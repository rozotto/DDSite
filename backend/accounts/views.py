from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import login
from django.contrib.auth.forms import AuthenticationForm



from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages


def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()  # Сохраняем пользователя в базе данных
            messages.success(request, 'Ваш аккаунт был создан! Вы можете войти.')
            return redirect('login')  # Перенаправляем на страницу входа
        else:
            messages.error(request, 'Пожалуйста, исправьте ошибки в форме.')
    else:
        form = UserCreationForm()

    return render(request, 'accounts/register.html', {'form': form})


def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)

            if user is not None:
                login(request, user)  # Авторизация пользователя
                return redirect('home')  # Перенаправляем на главную страницу
            else:
                messages.error(request, "Неверное имя пользователя или пароль.")
        else:
            messages.error(request, "Пожалуйста, исправьте ошибки в форме.")
    else:
        form = AuthenticationForm()

    return render(request, 'accounts/login.html', {'form': form})

def logout_view(request):
    logout(request)  # Выход из системы
    return redirect('home')  # Перенаправляем на главную страницу