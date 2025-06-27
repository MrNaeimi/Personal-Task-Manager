# tasks/serializers.py
from rest_framework import serializers
from django.db import models
from tasks.models import Task # Import your Task model
from django.contrib.auth.models import User # Django's built-in User model
from django.contrib.auth import authenticate # For user login authentication

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model, used primarily for user registration.
    It handles creating a new user with a hashed password.
    """
    password = serializers.CharField(write_only=True) # Password should only be written (not read back)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password') # Fields to include in the serializer

    def create(self, validated_data):
        """
        Custom create method to correctly handle password hashing during user creation.
        """
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    Validates username/email and password, and authenticates the user.
    """
    username = serializers.CharField() # Can be username or email for login
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        """
        Validates the provided credentials (username/email and password)
        and authenticates the user.
        """
        username_or_email = data.get('username')
        password = data.get('password')

        if not username_or_email or not password:
            raise serializers.ValidationError("Must include 'username'/'email' and 'password'.")

        # Try to authenticate by username first
        user = authenticate(username=username_or_email, password=password)
        if user:
            data['user'] = user
            return data

        # If not found by username, try to authenticate by email
        try:
            user_by_email = User.objects.get(email=username_or_email)
            user = authenticate(username=user_by_email.username, password=password)
            if user:
                data['user'] = user
                return data
        except User.DoesNotExist:
            pass # If user not found by email, continue to raise error

        # If no user was found/authenticated
        raise serializers.ValidationError("Invalid credentials.")


class TaskSerializer(serializers.ModelSerializer):
    """
    Serializer for the Task model.
    Handles converting Task model instances to/from JSON for API interactions.
    """
    # 'user' field is read-only and displays the username of the task owner
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Task
        fields = [
            'id', 'user', 'title', 'status', 'priority', 'due_date',
            'comment', 'created_at', 'done_at'
        ]
        # These fields are automatically set by Django/database and shouldn't be set by client
        read_only_fields = ['created_at', 'done_at']

    def create(self, validated_data):
        """
        Custom create method to automatically link the task to the currently authenticated user.
        """
        # 'self.context['request'].user' gets the currently logged-in user from the request
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """
        Custom update method to handle the 'done_at' timestamp logic.
        Sets 'done_at' when status becomes 'done', clears it otherwise.
        """
        # Check if status is being changed to 'done' and 'done_at' is not already set
        if 'status' in validated_data and validated_data['status'] == 'done' and not instance.done_at:
            instance.done_at = models.DateTimeField(auto_now=True).now() # Set current time
        # Check if status is being changed from 'done' to something else, and 'done_at' was set
        elif 'status' in validated_data and validated_data['status'] != 'done' and instance.done_at:
            instance.done_at = None # Clear the timestamp

        return super().update(instance, validated_data)