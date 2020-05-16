

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

from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics


from django.http import HttpResponse, JsonResponse
from rest_framework.parsers import JSONParser


# Serve Single Page Application
index = never_cache(TemplateView.as_view(template_name='index.html'))


#API Viewsets


class VehicleList(generics.ListAPIView):
    permission_classes = (IsAdminUser, )
    queryset = models.Vehicle.objects.all()
    serializer_class = serializers.VehicleSerializer
"""
class UserVehicleView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        queryset = models.Vehicle.objects
        string_ret = 'hello, '+name
        content = {'message': string_ret}
        return Response(content)
"""

"""class UserVehicleList(generics.ListAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = serializers.VehicleSerializer

    def get_queryset(self):
        user = self.request.user
        return models.Vehicle.objects.filter(owner=user)"""

class UserVehicleList(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, format=None):
        vehicles = models.Vehicle.objects.filter(owner=request.user)
        serializer = serializers.VehicleListSerializer(vehicles, many=True, context={'request':request})
        return Response(serializer.data)

    def post(self, request, format=None):
        data=request.data
        data['owner']=f'/user/{request.user.id}/'
        print(data)
        serializer = serializers.VehicleSerializer(data=data, context={'request':request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EmissionList(APIView):
    permission_classes = (IsAdminUser,)
    #List all emissions
    
    def get(self, request, format=None):
        emissions = models.EmissionInstance.objects.all()
        serializer = serializers.EmissionSerializer(emissions, many=True, context={'request':request})
        return Response(serializer.data)

class UserEmissionList(APIView):
    permission_classes = (IsAuthenticated,)
    #List all user's emissions, or create a new one.
    
    def get(self, request, format=None):
        emissions = models.EmissionInstance.objects.filter(user=request.user)
        serializer = serializers.EmissionListSerializer(emissions, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        data=request.data
        data['user']=f'/user/{request.user.id}/'
        print(data)
        serializer = serializers.EmissionSerializer(data=data, context={'request':request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EmissionDetail(APIView):
    permission_classes = (IsAuthenticated,)
    """
    Retrieve, update or delete an emission.
    """
    def get_object(self,pk):
        try:
            return models.EmissionInstance.objects.get(pk=pk)
        except models.EmissionInstance.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        emission = self.get_object(pk)
        serializer = serializers.EmissionSerializer(emission)
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        emission = self.get_object(pk)
        serializer = serializers.EmissionSerializer(emission, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        emission = self.get_object(pk)
        emission.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class FuelTypeList(generics.ListAPIView):
    queryset = models.FuelType.objects.all()
    serializer_class = serializers.FuelTypeSerializer

class FuelDetail(generics.RetrieveAPIView):
    queryset = models.FuelType.objects.all()
    serializer_class = serializers.FuelTypeSerializer

class EconomyMetricList(generics.ListAPIView):
    queryset = models.EconomyMetric.objects.all()
    serializer_class = serializers.EconomyMetricSerializer

class ProfileList(generics.ListAPIView):
    permission_classes = (IsAdminUser, )
    serializer_class = serializers.ProfileSerializer
    queryset = models.Profile.objects.all()

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.UserSerializer
    queryset = models.Profile.objects.all()

class UserDetail(APIView):
    permission_classes = (IsAdminUser,)

    def get_object(self,pk):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        user = self.get_object(pk)
        serializer = serializers.UserSerializer(user)
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        user = self.get_object(pk)
        serializer = serializers.UserSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        user = self.get_object(pk)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)



class CurrentUser(APIView):
    permission_classes = (IsAuthenticated,)
    def get(self, request):
        content = {'username': request.user.username, 'id':request.user.pk}
        return Response(content)


class UserCreate(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = serializers.CreateUserSerializer
    permission_classes = (AllowAny, )




