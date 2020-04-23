

from django.views.generic import TemplateView
from django.views.decorators.cache import never_cache
from . import models
from rest_framework import viewsets
from rest_framework import permissions
from . import serializers

from django.http import HttpResponseRedirect
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import UserSerializer, UserSerializerWithToken

# Serve Single Page Application
index = never_cache(TemplateView.as_view(template_name='index.html'))


#API Viewsets
class VehicleViewSet(viewsets.ModelViewSet):
    queryset = models.Vehicle.objects.all()
    serializer_class = serializers.VehicleSerializer

class FuelTypeViewSet(viewsets.ModelViewSet):
    queryset = models.FuelType.objects.all()
    serializer_class = serializers.FuelTypeSerializer

class EconomyMetricViewSet(viewsets.ModelViewSet):
    queryset = models.EconomyMetric.objects.all()
    serializer_class = serializers.EconomyMetricSerializer

class ProfileViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.ProfileSerializer
    queryset = models.Profile.objects.all()

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.UserSerializer
    queryset = models.Profile.objects.all()




@api_view(['GET'])
def current_user(request):
    """
    Determine the current user by their token, and return their data
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


class UserList(APIView):
    """
    Create a new user. It's called 'UserList' because normally we'd have a get
    method here too, for retrieving a list of all User objects.
    """
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        serializer = UserSerializerWithToken(data=request.data)
        if serializer.is_valid():
            print("SERIALIZER is valid")
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print("SERIALIZER is invalid")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
