from . import models
from rest_framework import serializers
from django.contrib.auth.models import User
from django.core.validators import EmailValidator
from django.contrib.auth.password_validation import validate_password

class DonationRecipientSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = models.DonationRecipient
        fields = ['name', 'country', 'website', 'donation_link', 'currency', 'description']

class PaymentSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = models.Payment
        fields = ['amount', 'currency', 'recipient', 'date', 'user']


class VehicleSerializer(serializers.HyperlinkedModelSerializer):
    #owner = serializers.HyperlinkedRelatedField(view_name="user-detail", queryset=User.objects.all())
    fuel = serializers.HyperlinkedRelatedField(view_name="fuel-detail", queryset=models.FuelType.objects.all())

    class Meta:
        model = models.Vehicle
        fields = ['name', 'fuel', 'economy', 'owner', 'id']

class VehicleListSerializer(serializers.HyperlinkedModelSerializer):
    #fuel = serializers.HyperlinkedRelatedField(view_name="fuel-detail", read_only=True)
    owner = serializers.StringRelatedField(read_only=True)
    fuel = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = models.Vehicle
        fields = ['name', 'fuel', 'economy', 'owner', 'id']

class FuelTypeSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = models.FuelType
        fields = ['name', 'unit', 'co2_per_unit', 'id']

class EconomyMetricSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = models.EconomyMetric
        fields = ['name']

class ProfileSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = models.Profile
        fields = ['user', 'location', 'date_of_birth', 'currency', 'currency_symbol', 'conversion_factor', 'display_units', 'id']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email')

class EmissionSerializer(serializers.HyperlinkedModelSerializer):
    fuel = serializers.HyperlinkedRelatedField(view_name="fuel-detail", queryset=models.FuelType.objects.all())
    tax_type = serializers.HyperlinkedRelatedField(view_name="tax-detail", queryset=models.TaxRate.objects.all())
    class Meta:
        model = models.EmissionInstance
        fields = ['name', 'date', 'distance', 'fuel', 'economy', 'co2_output_kg', 'tax_type', 'split', 'price', 'user', 'id']

class EmissionListSerializer(serializers.HyperlinkedModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = models.EmissionInstance
        fields = ['name', 'date', 'tax_type', 'distance', 'co2_output_kg', 'price', 'user', 'split', 'id']

class TaxRateSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model=models.TaxRate
        fields = ['name', 'price_per_kg', 'category', 'user', 'id', 'isDefault', 'usage']

class TaxRateListSerializer(serializers.HyperlinkedModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    class Meta:
        model=models.TaxRate
        fields = ['name', 'price_per_kg', 'category', 'user', 'id', 'isDefault', 'usage']

class CreateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password')
        email = validated_data['email']
        print(email)

        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user



class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for password change endpoint.
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value


