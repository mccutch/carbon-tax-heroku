# carbontax/urls.py

from django.urls import path, include
from . import views
from rest_framework import routers
from . import views
from rest_framework_simplejwt import views as jwt_views
from rest_framework.urlpatterns import format_suffix_patterns


router = routers.DefaultRouter()
router.register(r'vehicles', views.VehicleViewSet)
router.register(r'fueltypes', views.FuelTypeViewSet)
router.register(r'economymetrics', views.EconomyMetricViewSet)
router.register(r'profiles', views.ProfileViewSet)

urlpatterns = [
    path('', views.index, name='index'),
    path('', include(router.urls)),
    path('api/token/', jwt_views.TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
    path('current-user/', views.CurrentUser.as_view(), name="current-user"),
    path('my-vehicles/', views.UserVehicleList.as_view(), name="my-vehicles"),
    path('my-emissions/', views.UserEmissionList.as_view(), name="my-emissions"),
    path('emissions/', views.EmissionList.as_view(), name="emissions"),
    path('emission/<int:pk>/', views.EmissionDetail.as_view()),
]

#urlpatterns = format_suffix_patterns(urlpatterns)
