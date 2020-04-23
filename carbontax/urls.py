# carbontax/urls.py

from django.urls import path, include
from . import views
from rest_framework import routers
from . import views


router = routers.DefaultRouter()
router.register(r'vehicles', views.VehicleViewSet)
router.register(r'fueltypes', views.FuelTypeViewSet)
router.register(r'economymetrics', views.EconomyMetricViewSet)
router.register(r'profiles', views.ProfileViewSet)

urlpatterns = [
    path('', views.index, name='index'),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('', include(router.urls)),
    path('current_user/', views.current_user),
    path('users/', views.UserList.as_view()),
]
