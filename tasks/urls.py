# tasks/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter # برای ایجاد خودکار URLهای CRUD
from .views import RegisterView, LoginView, LogoutView, TaskViewSet # Viewهایی که ساختیم را وارد می‌کنیم

# ایجاد یک روتر برای ViewSet (برای مدل Task)
router = DefaultRouter()
# 'tasks' نامی است که در URL ظاهر می‌شود (مثلاً /api/tasks/)
# TaskViewSet کلاسی است که برای این URLها استفاده می‌شود
# basename='task' برای کمک به ساخت URLهای معکوس استفاده می‌شود
router.register(r'tasks', TaskViewSet, basename='task')

urlpatterns = [
    # URLهای احراز هویت
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),

    # URLهای API مدیریت وظایف (توسط روتر مدیریت می‌شوند)
    # این خط شامل /api/tasks/ و /api/tasks/<id>/ می‌شود
    path('', include(router.urls)),
]