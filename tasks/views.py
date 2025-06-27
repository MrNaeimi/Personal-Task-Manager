# tasks/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token # برای ساخت توکن احراز هویت
from rest_framework.views import APIView
from rest_framework import viewsets # برای عملیات CRUD روی مدل‌ها
from django_filters.rest_framework import DjangoFilterBackend # برای فیلتر کردن نتایج API

from .models import Task # مدل Task خودمان
from .serializers import UserSerializer, LoginSerializer, TaskSerializer # سریالایزرهای ساخته شده
from django.contrib.auth.models import User # مدل داخلی User جنگو

# --- Authentication Views (نماهای احراز هویت) ---

class RegisterView(generics.CreateAPIView):
    """
    API endpoint for user registration.
    Creates a new user and generates an authentication token for them.
    """
    queryset = User.objects.all() # queryset لازم برای CreateAPIView
    serializer_class = UserSerializer # از UserSerializer برای پردازش داده‌ها استفاده می‌کنیم
    permission_classes = [permissions.AllowAny] # به هر کسی اجازه ثبت‌نام می‌دهد

    def perform_create(self, serializer):
        """
        بعد از ساخت کاربر، برای او یک توکن احراز هویت می‌سازد.
        """
        user = serializer.save() # کاربر را ذخیره می‌کند (با پسورد هش شده)
        Token.objects.get_or_create(user=user) # توکن را برای کاربر جدید می‌سازد یا اگر دارد، می‌گیرد.

class LoginView(APIView):
    """
    API endpoint for user login.
    Authenticates user and returns their authentication token.
    """
    permission_classes = [permissions.AllowAny] # به هر کسی اجازه تلاش برای ورود می‌دهد

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data) # داده‌های درخواست را با LoginSerializer پردازش می‌کند
        serializer.is_valid(raise_exception=True) # اعتبارسنجی می‌کند، اگر خطا بود، ارور می‌دهد
        user = serializer.validated_data['user'] # کاربر اعتبارسنجی شده را می‌گیرد
        token, created = Token.objects.get_or_create(user=user) # توکن کاربر را می‌گیرد یا می‌سازد
        return Response({'token': token.key, 'user_id': user.id, 'username': user.username})

class LogoutView(APIView):
    """
    API endpoint for user logout.
    Deletes the user's authentication token, invalidating their session.
    """
    permission_classes = [permissions.IsAuthenticated] # فقط کاربران احراز هویت شده می‌توانند لاگ‌اوت کنند

    def post(self, request):
        request.user.auth_token.delete() # توکن احراز هویت کاربر را حذف می‌کند
        return Response(status=status.HTTP_200_OK) # پاسخ موفقیت‌آمیز برمی‌گرداند

# --- Task Management Views (نماهای مدیریت وظایف) ---

class TaskViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing user tasks (CRUD operations).
    Users can only see and manage their own tasks.
    Includes filtering by status, priority, and due date.
    """
    serializer_class = TaskSerializer # از TaskSerializer استفاده می‌کند
    permission_classes = [permissions.IsAuthenticated] # فقط کاربران احراز هویت شده می‌توانند دسترسی داشته باشند

    # بک‌اند فیلتر برای امکان جستجوهایی مانند ?status=todo&priority=now
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'priority', 'due_date'] # فیلدهایی که می‌توان بر اساس آن‌ها فیلتر کرد

    def get_queryset(self):
        """
        اطمینان حاصل می‌کند که هر کاربر فقط وظایف خود را ببیند و مدیریت کند.
        """
        return Task.objects.filter(user=self.request.user).order_by('-created_at') # فقط وظایف کاربر فعلی

    def perform_create(self, serializer):
        """
        هنگام ساخت یک وظیفه جدید، آن را به صورت خودکار به کاربر احراز هویت شده فعلی لینک می‌کند.
        """
        serializer.save(user=self.request.user) # کاربر را به وظیفه اضافه می‌کند