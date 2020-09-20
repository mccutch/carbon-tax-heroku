# carbontax/urls.py

from django.urls import path, include
from . import views
from rest_framework_simplejwt import views as jwt_views
from rest_framework.urlpatterns import format_suffix_patterns
from django.contrib.auth import views as auth_views
from django.views.generic.base import TemplateView #Serve sw.js



urlpatterns = [
    path('', views.index, name='index'),
    path('sw.js', TemplateView.as_view(template_name="sw.js", content_type='application/javascript'), name='sw.js'),


    path('api/token/', jwt_views.TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
    path('api-auth/', include('rest_framework.urls')),

    path('user/current-user/', views.CurrentUser.as_view(), name="current-user"),
    path('user/<int:pk>/', views.UserDetail.as_view(), name="user-detail"),
    path('account/register/', views.UserCreate.as_view(), name="create-user"),
    path('account/update-password/', views.UpdatePassword.as_view(), name="update-password"),
    path('account/', include('django.contrib.auth.urls')), # django default password reset views

    #path('profiles/', views.ProfileList.as_view(), name="profiles"),
    path('user/my-profile/', views.UserProfile.as_view(), name="my-profile"),
    path('profile/<int:pk>/', views.ProfileDetail.as_view(), name="profile-detail"),
    path('registration/check-username/', views.ValidateUsername.as_view(), name="check-username"),
    path('registration/check-email/', views.ValidateEmail.as_view(), name="check-email"),
    path('registration/check-unique/', views.CheckUnique.as_view(), name="check-unique"),

    path('user/my-vehicles/', views.UserVehicleList.as_view(), name="my-vehicles"),
    #path('vehicles/', views.VehicleList.as_view(), name="vehicles"),
    path('vehicle/<int:pk>/', views.VehicleDetail.as_view(), name="vehicle-detail"),

    path('user/my-emissions/', views.UserEmissionList.as_view(), name="my-emissions"),
    path('emission/<int:pk>/', views.EmissionDetail.as_view(), name="emission-detail"),

    path('backdate-tax-change/<int:pk>/', views.BackdateTaxChange.as_view(), name="backdate-tax-change"),
    
    path('fueltypes/', views.FuelTypeList.as_view(), name="fuels"),
    path('fuel/<int:pk>/', views.FuelDetail.as_view(), name="fuel-detail"),
    #path('economymetrics/', views.EconomyMetricList.as_view(), name="economymetrics"),

    path('user/my-taxes/', views.UserTaxList.as_view(), name="my-taxes"),
    path('tax/<int:pk>/', views.TaxDetail.as_view(), name="tax-detail"),

    path('user/my-stats/', views.UserStats.as_view(), name="my-stats"),

    path('user/my-payments/', views.UserPayments.as_view(), name="my-payments"),
    path('payment/<int:pk>/', views.PaymentDetail.as_view(), name="payment-detail"),

    path('user/my-recipients/', views.UserRecipients.as_view(), name="my-recipients"),
    path('donation-recipients/', views.DonationRecipients.as_view(), name="donation-recipients"),
    path('donation-recipient/<int:pk>/', views.DonationRecipientDetail.as_view(), name="donationrecipient-detail"),

    path('test-email/', views.testEmail),
    path('contact-form/', views.ContactForm.as_view(), name="contact-form"),
]

#urlpatterns = format_suffix_patterns(urlpatterns)
