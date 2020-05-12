from . import models
from rest_framework import serializers
from django.contrib.auth.models import User


class VehicleSerializer(serializers.HyperlinkedModelSerializer):
    # This seems to prevent a POST
    fuel = serializers.HyperlinkedRelatedField(view_name="fuel-detail", read_only=True)
    owner = serializers.HyperlinkedRelatedField(view_name="user-detail", read_only=True)

    class Meta:
        model = models.Vehicle
        fields = ['name', 'fuel', 'economy', 'owner']

class FuelTypeSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = models.FuelType
        fields = ['name', 'unit', 'co2_per_unit']

class EconomyMetricSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = models.EconomyMetric
        fields = ['name']

class ProfileSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = models.Profile
        fields = ['user', 'location', 'date_of_birth']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username',)


class EmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.EmissionInstance
        fields = ['name', 'date', 'travel_mode', 'distance', 'co2_output_kg', 'price', 'user']
