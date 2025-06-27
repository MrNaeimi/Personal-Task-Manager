# tasks/models.py
from django.db import models
from django.contrib.auth.models import User # Django's built-in User model

class Task(models.Model):
    STATUS_CHOICES = [
        ('todo', 'To Do'),
        ('in_progress', 'In Progress'),
        ('done', 'Done'),
    ]

    PRIORITY_CHOICES = [
        ('now', 'Now'),
        ('then', 'Then'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='todo')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='then')
    due_date = models.DateField(null=True, blank=True)
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    done_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['priority', 'due_date', '-created_at']

    def __str__(self):
        return f"{self.title} ({self.status}) by {self.user.username}"

    def save(self, *args, **kwargs):
        if self.status == 'done' and not self.done_at:
            self.done_at = models.DateTimeField(auto_now=True).now()
        elif self.status != 'done' and self.done_at:
            self.done_at = None
        super().save(*args, **kwargs)