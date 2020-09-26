# carbontax/urls.py

from django.urls import path, include
from . import views
from rest_framework_simplejwt import views as jwt_views
from rest_framework.urlpatterns import format_suffix_patterns
from django.contrib.auth import views as auth_views
from django.views.generic.base import TemplateView #Serve sw.js



urlpatterns = [
    # STATIC ASSETS
    #path('', views.index, name='index'),
    path('', TemplateView.as_view(template_name="index.html"), name='index'),   
    path('sw.js', TemplateView.as_view(template_name="sw.js", content_type='application/javascript'), name='sw.js'),
    path('index.html', TemplateView.as_view(template_name="index.html", content_type='application/javascript'), name='index.html'),   
    path('asset-manifest.json', TemplateView.as_view(template_name="asset-manifest.json", content_type='application/javascript'), name='asset-manifest'),

    # NOCACHE FUNCTIONS
    path('function/ping/', views.Ping.as_view(), name='ping'),
    path('function/backdate-tax-change/<int:pk>/', views.BackdateTaxChange.as_view(), name="backdate-tax-change"),
    path('function/test-email/', views.testEmail),
    path('function/contact-form/', views.ContactForm.as_view(), name="contact-form"),

    # JWT FUNCTIONS
    path('token/', jwt_views.TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
    path('api-auth/', include('rest_framework.urls')), # Login function on browsable APIs

    # CACHE-FIRST USER ASSETS
    path('user/current-user/', views.CurrentUser.as_view(), name="current-user"),
    path('user/my-profile/', views.UserProfile.as_view(), name="my-profile"),
    path('user/my-vehicles/', views.UserVehicleList.as_view(), name="my-vehicles"),
    path('user/my-emissions/', views.UserEmissionList.as_view(), name="my-emissions"),
    path('user/my-taxes/', views.UserTaxList.as_view(), name="my-taxes"),
    path('user/my-stats/', views.UserStats.as_view(), name="my-stats"),
    path('user/my-payments/', views.UserPayments.as_view(), name="my-payments"),
    path('user/my-recipients/', views.UserRecipients.as_view(), name="my-recipients"),


    # DATABASE OBJECTS
    path('api/user/<int:pk>/', views.UserDetail.as_view(), name="user-detail"),
    path('api/profile/<int:pk>/', views.ProfileDetail.as_view(), name="profile-detail"),
    path('api/vehicle/<int:pk>/', views.VehicleDetail.as_view(), name="vehicle-detail"),
    path('api/emission/<int:pk>/', views.EmissionDetail.as_view(), name="emission-detail"),
    path('api/tax/<int:pk>/', views.TaxDetail.as_view(), name="tax-detail"),
    path('api/payment/<int:pk>/', views.PaymentDetail.as_view(), name="payment-detail"),
    path('api/recipient/<int:pk>/', views.DonationRecipientDetail.as_view(), name="recipient-detail"),

    # ACCOUNT/REGISTRATION - NOCACHE
    path('account/register/', views.UserCreate.as_view(), name="create-user"),
    path('account/update-password/', views.UpdatePassword.as_view(), name="update-password"),
    path('account/', include('django.contrib.auth.urls')), # django default password reset views  
    path('registration/check-username/', views.ValidateUsername.as_view(), name="check-username"),
    path('registration/check-email/', views.ValidateEmail.as_view(), name="check-email"),
    path('registration/check-unique/', views.CheckUnique.as_view(), name="check-unique"),
    
    # JUNK - NEED TO SORT THIS OUT
    path('fueltypes/', views.FuelTypeList.as_view(), name="fuels"),
    path('fuel/<int:pk>/', views.FuelDetail.as_view(), name="fuel-detail"),
    path('recipients/', views.DonationRecipients.as_view(), name="recipients"),
]

