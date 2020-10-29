from . import models
from rest_framework import serializers
from django.contrib.auth.models import User
from django.core.validators import EmailValidator
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'id']



class ProfileSerializer(serializers.HyperlinkedModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    recipients = serializers.PrimaryKeyRelatedField(queryset=models.DonationRecipient.objects.all(), many=True)
    class Meta:
        model = models.Profile
        fields = ['user', 'location', 'date_of_birth', 'currency', 'currency_symbol', 'conversion_factor', 'display_units', 'recipients', 'loc_lat', 'loc_lng', 'id']



class VehicleSerializer(serializers.HyperlinkedModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    fuel = serializers.PrimaryKeyRelatedField(queryset=models.FuelType.objects.all())
    class Meta:
        model = models.Vehicle
        fields = ['name', 'fuel', 'economy', 'owner', 'id']



class EmissionSerializer(serializers.HyperlinkedModelSerializer):
    fuel = serializers.PrimaryKeyRelatedField(queryset=models.FuelType.objects.all())
    tax_type = serializers.PrimaryKeyRelatedField(queryset=models.TaxRate.objects.all())
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    class Meta:
        model = models.EmissionInstance
        fields = ['name', 'date', 'distance', 'fuel', 'economy', 'co2_output_kg', 'tax_type', 'split', 'price', 'user', 'format_encoding', 'offset', 'id']



class TaxRateSerializer(serializers.HyperlinkedModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    class Meta:
        model=models.TaxRate
        fields = ['name', 'price_per_kg', 'category', 'user', 'id', 'isDefault', 'usage']



class PaymentSerializer(serializers.HyperlinkedModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    recipient = serializers.PrimaryKeyRelatedField(queryset=models.DonationRecipient.objects.all())
    class Meta:
        model = models.Payment
        fields = ['amount', 'recipient', 'date', 'user', 'id']



class DonationRecipientSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = models.DonationRecipient
        fields = ['name', 'country', 'website', 'donation_link', 'description', 'id']



class FuelTypeSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = models.FuelType
        fields = ['name', 'unit', 'co2_per_unit', 'id']



class CreateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name', 'id')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data['email'] = validated_data['email'].lower()

        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user



class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    def validate_new_password(self, value):
        validate_password(value)
        return value


class FlexibleJWTSerializer(TokenObtainPairSerializer):
    # Accepts case-insensitive username or email
    # Credit: lardorm https://stackoverflow.com/questions/34332074/django-rest-jwt-login-using-username-or-email
    def validate(self, attrs):
        credentials = {
            'username': '',
            'password': attrs.get("password")
        }
        user_obj = User.objects.filter(email__iexact=attrs.get("username")).first() or User.objects.filter(username__iexact=attrs.get("username")).first()
        if user_obj:
            credentials['username'] = user_obj.username
        return super().validate(credentials)





