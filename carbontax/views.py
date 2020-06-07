

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

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter


# Serve Single Page Application
index = never_cache(TemplateView.as_view(template_name='index.html'))



# -----------VEHICLES-----------
"""class VehicleList(generics.ListAPIView):
    permission_classes = (IsAdminUser, )
    queryset = models.Vehicle.objects.all()
    serializer_class = serializers.VehicleSerializer"""

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

class VehicleDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (IsAuthenticated, permissions.IsOwner,)
    serializer_class = serializers.VehicleSerializer
    def get_queryset(self):
        print(self.request)
        user = self.request.user
        return user.vehicles.all()


# -----------EMISSIONS-----------

class UserEmissionList(generics.ListCreateAPIView):
    #queryset = models.EmissionInstance.objects.all()
    permission_classes = (IsAuthenticated, )
    serializer_class = serializers.EmissionSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filter_fields = {
        'tax_type': ['exact'],
        'date': ['lte', 'gte'],
    }
    search_fields = ['name']

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

class EmissionDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (IsAuthenticated, permissions.IsOwner)
    serializer_class = serializers.EmissionSerializer


# -----------HELPER MODELS-----------
class FuelTypeList(generics.ListAPIView):
    queryset = models.FuelType.objects.all()
    serializer_class = serializers.FuelTypeSerializer

class FuelDetail(generics.RetrieveAPIView):
    queryset = models.FuelType.objects.all()
    serializer_class = serializers.FuelTypeSerializer

"""class EconomyMetricList(generics.ListAPIView):
    queryset = models.EconomyMetric.objects.all()
    serializer_class = serializers.EconomyMetricSerializer"""



# -----------USER/PROFILE-----------
"""class ProfileList(generics.ListAPIView):
    permission_classes = (IsAdminUser, )
    serializer_class = serializers.ProfileSerializer
    queryset = models.Profile.objects.all()"""

class UserProfile(APIView):
    permission_classes = (IsAuthenticated,)
    
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

class ProfileDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (IsAuthenticated, permissions.IsOwner)
    serializer_class = serializers.ProfileSerializer
    queryset = models.Profile.objects.all()   

class UserDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (IsAuthenticated, permissions.IsOwner)
    serializer_class = serializers.UserSerializer
    queryset = User.objects.all()

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

class TaxDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (IsAuthenticated, permissions.IsOwner)
    serializer_class = serializers.TaxRateSerializer
    queryset = models.TaxRate.objects.all()


"""class AllUserStats(APIView){
    
}"""

class UserStats(APIView):
    permission_classes = (IsAuthenticated, )

    def get_tax_types(self, request):
        emissions = request.user.emissions.all()
        taxes_used = []
        for emission in emissions:
            if not emission.tax_type in taxes_used:
                taxes_used.append(emission.tax_type)
        return taxes_used

    def get_months(self, request):
        emissions = request.user.emissions.all()
        months = []
        for emission in emissions:
            month = {'year': emission.date.year, 'month':emission.date.month}
            if not month in months:
                months.append(month)
        return months

    def get_emissions_by_tax(self, request):
        emissions_by_tax = {}
        emissions_by_tax["total"]={}
        tax_types = self.get_tax_types(request)

        co2_total = 0
        price_total = 0

        for tax_type in tax_types:
            if not tax_type:
                continue

            emissions_by_tax[tax_type] = {}

            emissions = request.user.emissions.filter(tax_type=tax_type)
            co2_tax_total = 0
            price_tax_total = 0
            for emission in emissions:
                #print(emission.co2_output_kg)
                co2_tax_total += emission.co2_output_kg
                price_tax_total += emission.price

            emissions_by_tax[tax_type]['co2_kg']=co2_tax_total
            emissions_by_tax[tax_type]['price']=price_tax_total
            co2_total += co2_tax_total
            price_total += price_tax_total

        emissions_by_tax['total']['co2_kg']=co2_total
        emissions_by_tax['total']['price']=price_total
        return emissions_by_tax
    
    def get_emissions_by_month_and_tax(self, request):
        emissions_by_month_and_tax  = {}
        
        months = self.get_months(request)
        tax_types = self.get_tax_types(request)

        for month in months:
            thisMonth = month['month']
            thisYear = month['year']
            monthString=f'{thisYear}-{thisMonth}'

            emissions_by_month_and_tax[monthString] = {}
            co2_month_total=0
            price_month_total=0

            for tax_type in tax_types:
                emissions = request.user.emissions.filter(tax_type=tax_type)
                emissions_by_month_and_tax[monthString]['total'] = {}
                emissions_by_month_and_tax[monthString][tax_type] = {}

                co2_total = 0
                price_total = 0
                for emission in emissions:
                    if(emission.date.year==thisYear and emission.date.month==thisMonth):
                        co2_total += emission.co2_output_kg
                        price_total += emission.price

                
                emissions_by_month_and_tax[monthString][tax_type]['co2_kg']=co2_total
                emissions_by_month_and_tax[monthString][tax_type]['price']=price_total
                co2_month_total += co2_total
                price_month_total += price_total

            emissions_by_month_and_tax[monthString]['total']['co2_kg']=co2_month_total
            emissions_by_month_and_tax[monthString]['total']['price']=price_month_total

        return emissions_by_month_and_tax

    def get(self, request):
        content = {
            'emissions_by_tax': self.get_emissions_by_tax(request),
            'emissions_by_month_and_tax': self.get_emissions_by_month_and_tax(request)
        }
        return Response(content)

