# carbontax/urls.py

from django.urls import path, include
from . import views
from rest_framework import routers
from . import views
from rest_framework_simplejwt import views as jwt_views


router = routers.DefaultRouter()
router.register(r'vehicles', views.VehicleViewSet)
router.register(r'fueltypes', views.FuelTypeViewSet)
router.register(r'economymetrics', views.EconomyMetricViewSet)
router.register(r'profiles', views.ProfileViewSet)

urlpatterns = [
    path('', views.index, name='index'),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('', include(router.urls)),
    path('api/token/', jwt_views.TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
    path('hello/', views.HelloView.as_view(), name='hello'),
    path('current-user/', views.CurrentUser.as_view(), name="current-user"),
    path('my-vehicles/', views.UserVehicleList.as_view(), name="my-vehicles"),
]
