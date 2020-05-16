# carbontax/urls.py

from django.urls import path, include
from . import views
from rest_framework_simplejwt import views as jwt_views
from rest_framework.urlpatterns import format_suffix_patterns



urlpatterns = [
    path('', views.index, name='index'),
    path('api/token/', jwt_views.TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),

    path('current-user/', views.CurrentUser.as_view(), name="current-user"),
    path('user/<int:pk>/', views.UserDetail.as_view(), name="user-detail"),

    path('profiles/', views.ProfileList.as_view(), name="profiles"),
    path('account/register/', views.UserCreate.as_view(), name="create-user"),

    path('my-vehicles/', views.UserVehicleList.as_view(), name="my-vehicles"),
    path('vehicles/', views.VehicleList.as_view(), name="vehicles"),

    path('my-emissions/', views.UserEmissionList.as_view(), name="my-emissions"),
    path('emissions/', views.EmissionList.as_view(), name="emissions"),
    path('emission/<int:pk>/', views.EmissionDetail.as_view(), name="emission-detail"),
    
    path('fueltypes/', views.FuelTypeList.as_view(), name="fuels"),
    path('fuel/<int:pk>/', views.FuelDetail.as_view(), name="fuel-detail"),
    path('economymetrics/', views.EconomyMetricList.as_view(), name="economymetrics"),


]

#urlpatterns = format_suffix_patterns(urlpatterns)
