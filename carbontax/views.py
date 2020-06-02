

from django.views.generic import TemplateView
from django.views.decorators.cache import never_cache

from . import models
from . import serializers
from django.contrib.auth.models import User

from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from . import permissions


# Serve Single Page Application
index = never_cache(TemplateView.as_view(template_name='index.html'))



# -----------VEHICLES-----------
class VehicleList(generics.ListAPIView):
    permission_classes = (IsAdminUser, )
    queryset = models.Vehicle.objects.all()
    serializer_class = serializers.VehicleSerializer

class UserVehicleList(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, format=None):
        vehicles = request.user.vehicles.all()
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

class VehicleDetail(APIView):
    permission_classes = (IsAuthenticated,)
    """
    Retrieve, update or delete a vehicle.
    """
    def is_owner(self, user_object, pk):
        requested_object = self.get_object(pk)
        if(user_object == requested_object):
            return True
        else:
            print("User does not own this object")
            return False

    def get_object(self,pk):
        try:
            return models.Vehicle.objects.get(pk=pk)
        except models.Vehicle.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        vehicle = self.get_object(pk)
        if(not self.is_owner(vehicle, pk)):
            return Response(status=status.HTTP_403_FORBIDDEN)
        serializer = serializers.VehicleSerializer(vehicle)
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        vehicle = self.get_object(pk)
        if(not self.is_owner(vehicle, pk)):
            return Response(status=status.HTTP_403_FORBIDDEN)

        serializer = serializers.VehicleSerializer(vehicle, data=request.data, context={'request':request}, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        vehicle = self.get_object(pk)
        if(not self.is_owner(vehicle, pk)):
            return Response(status=status.HTTP_403_FORBIDDEN)
        vehicle.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# -----------EMISSIONS-----------
class EmissionList(APIView):
    permission_classes = (IsAdminUser,)
    #List all emissions
    
    def get(self, request, format=None):
        emissions = models.EmissionInstance.objects.all()
        serializer = serializers.EmissionSerializer(emissions, many=True, context={'request':request})
        return Response(serializer.data)
"""
class UserEmissionList(APIView):
    permission_classes = (IsAuthenticated, permissions.IsOwner)
    #List all user's emissions, or create a new one.
    
    def get(self, request, format=None):
        emissions = request.user.emissions.all()
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
"""
class UserEmissionList(generics.ListCreateAPIView):
    #queryset = models.EmissionInstance.objects.all()
    permission_classes = (IsAuthenticated, )
    serializer_class = serializers.EmissionSerializer

    def get_queryset(self):
        user = self.request.user
        return user.emissions.all()

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
    permission_classes = [IsAuthenticated, ]
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
        serializer = serializers.EmissionSerializer(emission, context={'request':request})
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        emission = self.get_object(pk)
        serializer = serializers.EmissionSerializer(emission, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        emission = self.get_object(pk)
        emission.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# -----------HELPER MODELS-----------
class FuelTypeList(generics.ListAPIView):
    queryset = models.FuelType.objects.all()
    serializer_class = serializers.FuelTypeSerializer

class FuelDetail(generics.RetrieveAPIView):
    queryset = models.FuelType.objects.all()
    serializer_class = serializers.FuelTypeSerializer

class EconomyMetricList(generics.ListAPIView):
    queryset = models.EconomyMetric.objects.all()
    serializer_class = serializers.EconomyMetricSerializer



# -----------USER/PROFILE-----------
class ProfileList(generics.ListAPIView):
    permission_classes = (IsAdminUser, )
    serializer_class = serializers.ProfileSerializer
    queryset = models.Profile.objects.all()

class UserProfile(APIView):
    permission_classes = (IsAuthenticated,)
    #List all user's emissions, or create a new one.

    
    
    def get(self, request, format=None):
        profile = request.user.profile
        serializer = serializers.ProfileSerializer(profile, context={'request':request})
        return Response(serializer.data)

    def post(self, request, format=None):
        data=request.data
        data['user']=f'/user/{request.user.id}/'
        print(data)
        serializer = serializers.ProfileSerializer(data=data, context={'request':request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    

class ProfileDetail(APIView):
    permission_classes = (IsAuthenticated,)

    def get_object(self,pk):
        try:
            return models.Profile.objects.get(pk=pk)
        except models.Profile.DoesNotExist:
            raise Http404

    def is_owner(self, user_object, pk):
        requested_object = self.get_object(pk)
        if(user_object == requested_object):
            return True
        else:
            print("User does not own this object")
            return False

    def get(self, request, pk, format=None):
        profile = self.get_object(pk)
        if(not self.is_owner(profile, pk)):
            return Response(status=status.HTTP_403_FORBIDDEN)
        serializer = serializers.ProfileSerializer(profile, context={'request':request})
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        profile = request.user.profile
        if(not self.is_owner(profile, pk)):
            return Response(status=status.HTTP_403_FORBIDDEN)
        print(request.data)
        data = request.data
        #data['user']=f'/user/{request.user.id}/'
        serializer = serializers.ProfileSerializer(profile, data=data, context={'request':request}, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserDetail(APIView):
    permission_classes = (IsAuthenticated,)

    def get_object(self,pk):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            raise Http404

    def is_owner(self, user_object, pk):
        requested_object = self.get_object(pk)
        if(user_object == requested_object):
            return True
        else:
            print("User does not own this object")
            return False

    def get(self, request, pk, format=None):
        user = self.get_object(pk)
        if(not self.is_owner(user, pk)):
            return Response(status=status.HTTP_403_FORBIDDEN)

        serializer = serializers.UserSerializer(user)
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        user = self.get_object(pk)
        if(not self.is_owner(user, pk)):
            return Response(status=status.HTTP_403_FORBIDDEN)

        data = request.data
        #data['username']=f'{request.user.username}'
        print(data)

        serializer = serializers.UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        user = self.get_object(pk)
        if(not self.is_owner(user, pk)):
            return Response(status=status.HTTP_403_FORBIDDEN)

        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)



class CurrentUser(APIView):
    permission_classes = (IsAuthenticated,)
    def get(self, request):
        user=request.user
        email=user.email
        first=user.first_name
        last=user.last_name

        content = {
            'username': user.username, 
            'id': user.pk,
            'email': email,
            'first_name': first,
            'last_name': last,
        }
        return Response(content)


class ValidateUsername(APIView):
    permission_classes = (AllowAny, )

    def post(self, request):
        print(request.data['username'])

        if User.objects.filter(username=request.data['username']).exists():
            result="false"
        else:
            result="true"
        content = {"unique":result}
        return Response(content)

class UserCreate(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = serializers.CreateUserSerializer
    permission_classes = (AllowAny, )



# -----------TAXES-----------
class UserTaxList(APIView):
    permission_classes = (IsAuthenticated,)
    #List all user's taxes, or create a new one.
    
    def get(self, request, format=None):
        taxes = request.user.taxes.all()
        serializer = serializers.TaxRateListSerializer(taxes, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        data=request.data
        data['user']=f'/user/{request.user.id}/'
        print(data)
        serializer = serializers.TaxRateSerializer(data=data, context={'request':request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TaxDetail(APIView):
    permission_classes = (IsAuthenticated,)
    """
    Retrieve, update or delete a tax.
    """

    def is_owner(self, user_object, pk):
        requested_object = self.get_object(pk)
        if(user_object == requested_object):
            return True
        else:
            print("User does not own this object")
            return False

    def get_object(self,pk):
        try:
            return models.TaxRate.objects.get(pk=pk)
        except models.TaxRate.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        tax = self.get_object(pk)
        serializer = serializers.TaxRateSerializer(tax)
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        tax = self.get_object(pk)
        serializer = serializers.TaxRateSerializer(tax, data=request.data, context={'request':request}, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        tax = self.get_object(pk)
        tax.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)




