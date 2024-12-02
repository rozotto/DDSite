from django.shortcuts import render, redirect

def home(request):
    if request.user.is_authenticated:
        # Если пользователь авторизован, показываем персонализированную страницу
        return render(request, 'home.html', {'user': request.user})
    else:
        # Если пользователь не авторизован, показываем заглушку или перенаправляем
        return redirect('login')

