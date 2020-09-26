

from django.views.generic import TemplateView
from django.views.decorators.cache import never_cache
#from django.db.models import Sum

from . import models
from . import serializers
from django.contrib.auth.models import User

from rest_framework import status, generics
from rest_framework.response import Response
from django.http import HttpResponse #test email
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from . import permissions

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter

from django.core.mail import send_mail


# Serve Single Page Application
index = never_cache(TemplateView.as_view(template_name='index.html'))



# -----------VEHICLES-----------

class UserVehicleList(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, format=None):
        vehicles = request.user.vehicles.all()
        serializer = serializers.VehicleSerializer(vehicles, many=True, context={'request':request})
        return Response(serializer.data)

    def post(self, request, format=None):
        data=request.data
        data['owner']=f'{request.user.id}'
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
        'tax_type__name': ['exact'],
        'date': ['lte', 'gte'],
    }
    search_fields = ['name']

    def get_queryset(self):
        user = self.request.user
        print(user)
        return user.emissions.all()

    def post(self, request, format=None):
        data=request.data
        data['user']=request.user.id
        print(data)
        serializer = serializers.EmissionSerializer(data=data, context={'request':request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EmissionDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (IsAuthenticated, permissions.IsOwner)
    serializer_class = serializers.EmissionSerializer
    def get_queryset(self):
        print(self.request)
        user = self.request.user
        return user.emissions.all()





# -----------HELPER MODELS-----------
class FuelTypeList(generics.ListAPIView):
    queryset = models.FuelType.objects.all()
    serializer_class = serializers.FuelTypeSerializer

class FuelDetail(generics.RetrieveAPIView):
    queryset = models.FuelType.objects.all()
    serializer_class = serializers.FuelTypeSerializer



# -----------USER/PROFILE-----------

class UserProfile(APIView):
    permission_classes = (IsAuthenticated,)
    
    def get(self, request, format=None):
        try:
            profile = request.user.profile
            serializer = serializers.ProfileSerializer(profile, context={'request':request})
            return Response(serializer.data)
        except:
            content = {
                "Profile":"Not found"
            }
            return Response(content)

    def post(self, request, format=None):
        data=request.data
        data['user']=request.user.id
        data['recipients']=[]
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

class ValidateEmail(APIView):
    permission_classes = (AllowAny, )

    def post(self, request):
        print(request.data['email'])

        if User.objects.filter(email=request.data['email']).exists():
            result="false"
        else:
            result="true"
        content = {"unique":result}
        return Response(content)

class CheckUnique(APIView):
    permission_classes = (AllowAny, )

    def post(self, request):
        print(request.data)
        content = {
            'uniqueEmail': not User.objects.filter(email=request.data['email']).exists(),
            'uniqueUsername': not User.objects.filter(username=request.data['username']).exists()
        }

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
        serializer = serializers.TaxRateSerializer(taxes, context={'request':request}, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        data=request.data
        data['user']=f'{request.user.id}'
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


# ---------PAYMENTS---------------
class UserPayments(generics.ListCreateAPIView):
    permission_classes = (IsAuthenticated, )
    serializer_class = serializers.PaymentSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filter_fields = {
        'recipient__name': ['exact'],
        'date': ['lte', 'gte'],
    }
    search_fields = ['recipient__name']

    def get_queryset(self):
        user = self.request.user
        return user.payments.all()

    def post(self, request, format=None):
        data=request.data
        data['user']=request.user.id
        print(data)
        serializer = serializers.PaymentSerializer(data=data, context={'request':request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PaymentDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (IsAuthenticated, permissions.IsOwner)
    serializer_class = serializers.PaymentSerializer
    def get_queryset(self):
        user = self.request.user
        return user.payments.all()



#--------DONATION RECIPIENTS----------------

class UserRecipients(APIView):
    """A list of all donation recipients saved by the user."""
    permission_classes = (IsAuthenticated, )

    def get(self, request, format=None):
        recipients = request.user.profile.recipients.all()
        serializer = serializers.DonationRecipientSerializer(recipients, context={'request':request}, many=True)
        return Response(serializer.data)

class DonationRecipients(generics.ListCreateAPIView):
    permission_classes = (AllowAny, )
    serializer_class = serializers.DonationRecipientSerializer
    queryset = models.DonationRecipient.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filter_fields = {
        'country': ['exact'],
    }
    search_fields = ['name', 'description']


class DonationRecipientDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (IsAuthenticated, )
    serializer_class = serializers.DonationRecipientSerializer
    queryset = models.DonationRecipient.objects.all()


class UserStats(APIView):
    permission_classes = (IsAuthenticated, )

    def get_tax_types(self, request):
        emissions = request.user.emissions.all()
        taxes_used = []
        for emission in emissions:
            if not emission.tax_type:
                continue
            if not emission.tax_type.id in taxes_used:
                taxes_used.append(emission.tax_type.id)
        return taxes_used

    def get_months(self, request):
        emissions = request.user.emissions.all()
        payments = request.user.payments.all()
        months = []
        
        if (len(emissions) == 0) and (len(payments) == 0):
            return months

        first_date = None
        last_date = None
        
        for emission in emissions:
            if first_date == None:
                first_date = emission.date
                last_date = emission.date
                continue
            if emission.date<first_date:
                first_date = emission.date
            elif emission.date>last_date:
                last_date = emission.date

        for payment in payments:
            if first_date == None:
                first_date = payment.date
                last_date = payment.date
                continue
            if payment.date<first_date:
                first_date = payment.date
            elif payment.date>last_date:
                last_date = payment.date

        i_year = first_date.year
        i_month = first_date.month
        
        while(not(i_year>=last_date.year and i_month>last_date.month)):
            if i_month>12:
                i_month=1
                i_year+=1

            new_month = {'year':i_year, 'month':i_month}
            if not new_month in months:
                months.append(new_month)
            i_month+=1

        months.sort(key=lambda x: (x['year'], x['month']))
        return months

    def get_emissions_by_tax(self, request):
        emissions_by_tax = {}
        emissions_by_tax["total"]={}
        tax_types = self.get_tax_types(request)

        co2_total = 0
        price_total = 0

        for tax_type in tax_types:
            emissions_by_tax[tax_type] = {}
            emissions = request.user.emissions.filter(tax_type=tax_type)
            co2_tax_total = 0
            price_tax_total = 0
            for emission in emissions:
                #print(emission.co2_output_kg)
                co2_tax_total += emission.co2_output_kg
                price_tax_total += emission.price*request.user.profile.conversion_factor

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

            emissions_by_month_and_tax[monthString]['total'] = {}
            for tax_type in tax_types:
                emissions = request.user.emissions.filter(tax_type=tax_type)
                emissions_by_month_and_tax[monthString][tax_type] = {}

                co2_total = 0
                price_total = 0
                for emission in emissions:
                    if(emission.date.year==thisYear and emission.date.month==thisMonth):
                        co2_total += emission.co2_output_kg
                        price_total += emission.price*request.user.profile.conversion_factor

                
                emissions_by_month_and_tax[monthString][tax_type]['co2_kg']=co2_total
                emissions_by_month_and_tax[monthString][tax_type]['price']=price_total
                co2_month_total += co2_total
                price_month_total += price_total

            emissions_by_month_and_tax[monthString]['total']['co2_kg']=co2_month_total
            emissions_by_month_and_tax[monthString]['total']['price']=price_month_total

        return emissions_by_month_and_tax

    def get_cumulative_payments_by_month(self, request):
        payments_by_month  = {}
        
        months = self.get_months(request)
        emissions = request.user.emissions.all()
        payments = request.user.payments.all()
        conversion_factor = request.user.profile.conversion_factor

        tax_total=0
        payment_total=0

        for month in months:
            thisMonth = month['month']
            thisYear = month['year']
            monthString=f'{thisYear}-{thisMonth}'

            payments_by_month[monthString] = {}
            
            for emission in emissions:
                if(emission.date.year==thisYear and emission.date.month==thisMonth):
                    tax_total += emission.price*conversion_factor
            for payment in payments:
                if(payment.date.year==thisYear and payment.date.month==thisMonth):
                    payment_total += payment.amount*conversion_factor
                
            payments_by_month[monthString]['tax']=tax_total
            payments_by_month[monthString]['paid']=payment_total

        return payments_by_month

    def get_summary(self, request):
        total_paid = 0
        total_tax = 0
        total_co2 = 0
        total_distance = 0

        emissions = request.user.emissions.all()
        for emission in emissions:
            total_tax += emission.price*request.user.profile.conversion_factor
            total_co2 += emission.co2_output_kg
            total_distance += emission.distance

        payments = request.user.payments.all()
        for payment in payments:
            total_paid += payment.amount*request.user.profile.conversion_factor

        return {
            'total_paid':total_paid,
            'total_tax':total_tax,
            'balance':total_tax-total_paid,
            'total_co2':total_co2,
            'total_distance':total_distance,
            'currency':request.user.profile.currency,
        }


    def get(self, request):
        content = {
            'summary': self.get_summary(request),
            'taxes': self.get_tax_types(request),
            'emissions_by_tax': self.get_emissions_by_tax(request),
            'emissions_by_month_and_tax': self.get_emissions_by_month_and_tax(request),
            'months': self.get_months(request),
            'payments_by_month': self.get_cumulative_payments_by_month(request),
        }
        return Response(content)


class UpdatePassword(APIView):
    """
    An endpoint for changing password.
    """
    permission_classes = (IsAuthenticated, )

    def get_object(self, queryset=None):
        return self.request.user

    def put(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = serializers.ChangePasswordSerializer(data=request.data)

        if serializer.is_valid():
            # Check old password
            old_password = serializer.data.get("old_password")
            if not self.object.check_password(old_password):
                return Response({"old_password": ["Wrong password."]}, 
                                status=status.HTTP_400_BAD_REQUEST)
            # set_password also hashes the password that the user will get
            self.object.set_password(serializer.data.get("new_password"))
            self.object.save()
            return Response(status=status.HTTP_204_NO_CONTENT)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class BackdateTaxChange(APIView):
    """
    Endpoint for backdating a change in tax rate to emissions that used this tax in the past.
    GET returns a list of all emissions using the tax rate, and a list of all using the rate since last payment.
    POST will update chosen emissions in the database.
    """
    permission_classes = (IsAuthenticated, )
    def get(self, request, pk):
        emissions = self.all_emissions(request, pk)
        emissions_since_payment = self.all_since_payment(request, emissions)
        
        content = {
            'all':serializers.EmissionSerializer(emissions, many=True, context={'request':request}).data,
            'sincePayment':serializers.EmissionSerializer(emissions_since_payment, many=True, context={'request':request}).data,
            'paymentDate':self.find_last_payment(request),
        }
        return Response(content)

    def post(self, request, pk, format=None):
        print(request.data['apply_to'])
        
        emissions = self.all_emissions(request, pk)

        if request.data['apply_to']=="sincePayment":
            emissions = self.all_since_payment(request, emissions)

        self.apply_change(request, emissions, pk)
        
        serializer = serializers.EmissionSerializer(emissions, many=True, context={'request':request})
        return Response(serializer.data)

    def all_emissions(self, request, pk):
        return request.user.emissions.filter(tax_type=self.kwargs['pk'])

    def all_since_payment(self, request, all_emissions):
        last_payment_date = self.find_last_payment(request)
        if last_payment_date:
            return all_emissions.filter(date__gt=last_payment_date)
        else:
            return all_emissions

    def find_last_payment(self, request):
        payments = request.user.payments.all().order_by('-date')
        if len(payments) > 0:
            return payments[0].date
        else:
            return False

    def apply_change(self, request, emissions, pk):
        print("Applying tax change to emissions in database.")
        tax_rate = request.user.taxes.get(pk=pk).price_per_kg
        print(f'New tax rate: {tax_rate}')

        for emission in emissions:
            emission.price = round(emission.co2_output_kg*tax_rate-emission.offset, 2)
            emission.save()



def testEmail(request):
    response = sendEmail(request)
    print(response)
    return HttpResponse('<h1>Page was found</h1>')

def sendEmail(request):
    numSent = send_mail(
        subject='Subject here', 
        message='Test email message', 
        #html_message=None,
        from_email='Carbon Accountant <contact@carbonaccountant.app>', 
        recipient_list=['jack.mccutchan@gmail.com'], 
        fail_silently=False,
    )
    if(numSent==1):
        return Response(status=status.HTTP_204_NO_CONTENT)
    else:
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from django.template.loader import render_to_string

class ContactForm(APIView):
    permission_classes = (AllowAny, )
    def post(self, request):
        print(request.data)
        if(request.user.is_authenticated):
            print(request.user.username)
        else:
            print("Not authenticated")
        context={
            "first_name": request.user.username if request.user.is_authenticated else "",
            #"email":"defaultEmail@example.com",
            #"src_banner":"http://cdn.mcauto-images-production.sendgrid.net/c84d4a731b72ca03/8c1086a9-5511-405c-afa7-237ddec5c6a3/2443x1629.JPG",
            "src_banner":"http://cdn.mcauto-images-production.sendgrid.net/c84d4a731b72ca03/ebd139b8-cbc1-4a14-ac88-b0b966e3a56f/1366x375.jpeg",
        }
        response = send_mail(
            subject='Re: Contact Form', 
            message=request.data['message'], 
            html_message=render_to_string('./static/emailTemplates/emailContent.html', context),
            #html_message='<p>That’s <strong>the HTML part</strong></p>',
            from_email='Carbon Accountant Admin <admin@carbonaccountant.app>', 
            recipient_list=['jack.mccutchan@gmail.com'], 
            fail_silently=False,
        )
        print(f'Response: {response}')
        return Response(status=status.HTTP_204_NO_CONTENT)


class Ping(APIView):
    """API endpoint to check status of server with minimal data transfer. Returns 204 no content."""
    permission_classes = (AllowAny, )
    def get(self, request):
        return Response(status=status.HTTP_204_NO_CONTENT)















