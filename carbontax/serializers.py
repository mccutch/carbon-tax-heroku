from . import models
from rest_framework import serializers
from django.contrib.auth.models import User


class VehicleSerializer(serializers.HyperlinkedModelSerializer):
    fuel = serializers.StringRelatedField()
    owner = serializers.StringRelatedField()

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
    #user = serializers.StringRelatedField()

    # Create a custom method field
    #user = serializers.SerializerMethodField('_user')
    
    

    # Use this method for the custom field
    def _user(self, obj):
        if self.context:
            return self.context['request'].user

    class Meta:
        model = models.EmissionInstance
        fields = ['name', 'date', 'travel_mode', 'distance', 'co2_output_kg', 'price', 'user']

class UserSerializerWithToken(serializers.ModelSerializer):

    token = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True)

    def get_token(self, obj):
        jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
        jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER

        payload = jwt_payload_handler(obj)
        token = jwt_encode_handler(payload)
        return token

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance

    class Meta:
        model = User
        fields = ('token', 'username', 'password')