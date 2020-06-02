# carbontax/urls.py

from django.urls import path, include
from . import views
from rest_framework_simplejwt import views as jwt_views
from rest_framework.urlpatterns import format_suffix_patterns

from django.http.response import HttpResponseRedirect
def handler404(request, *args, **kwargs):
    return HttpResponseRedirect('/')

urlpatterns = [
    path('', views.index, name='index'),
    path('api/token/', jwt_views.TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
    path('api-auth/', include('rest_framework.urls')),

    path('current-user/', views.CurrentUser.as_view(), name="current-user"),
    path('user/<int:pk>/', views.UserDetail.as_view(), name="user-detail"),
    path('account/register/', views.UserCreate.as_view(), name="create-user"),

    #path('profiles/', views.ProfileList.as_view(), name="profiles"),
    path('my-profile/', views.UserProfile.as_view(), name="my-profile"),
    path('profile/<int:pk>/', views.ProfileDetail.as_view(), name="profile-detail"),
    path('account/check-username/', views.ValidateUsername.as_view(), name="check-username"),

    path('my-vehicles/', views.UserVehicleList.as_view(), name="my-vehicles"),
    #path('vehicles/', views.VehicleList.as_view(), name="vehicles"),
    path('vehicle/<int:pk>/', views.VehicleDetail.as_view(), name="vehicle-detail"),

    path('my-emissions/', views.UserEmissionList.as_view(), name="my-emissions"),
    path('emission/<int:pk>/', views.EmissionDetail.as_view(), name="emission-detail"),
    
    path('fueltypes/', views.FuelTypeList.as_view(), name="fuels"),
    path('fuel/<int:pk>/', views.FuelDetail.as_view(), name="fuel-detail"),
    #path('economymetrics/', views.EconomyMetricList.as_view(), name="economymetrics"),

    path('my-taxes/', views.UserTaxList.as_view(), name="my-taxes"),
    path('tax/<int:pk>/', views.TaxDetail.as_view(), name="tax-detail"),
]

#urlpatterns = format_suffix_patterns(urlpatterns)
