from django.db import models
from django.contrib.auth.models import User

class EmissionInstance(models.Model):
    """
    Created when an entry is created from inputs.
    """
    name = models.CharField(max_length=30, null=True)
    date = models.DateField(null=True)
    travel_mode = models.CharField(max_length=30, null=True)
    distance = models.FloatField(null=True)
    co2_output_kg = models.FloatField(null=True)
    price = models.FloatField(null=True)


class FuelType(models.Model):
    name = models.CharField(max_length=30, unique=True)
    unit = models.CharField(max_length=30)
    co2_per_unit = models.FloatField()

    def __str__(self):
        """String for representing the Model object."""
        return f'{self.name}_{self.unit}'

class EconomyMetric(models.Model):
    name = models.CharField(max_length=30)

    def convert_to_L(self,num):
        if(self.name=='mpg'):
            return 100*3.785411784/(1.609344*num)
        elif(self.name=='L/100km'):
            return num
        else:
            return 0

    def __str__(self):
        return self.name

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    location = models.CharField(max_length=30, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)

    def __str__(self):
        """String for representing the Model object."""
        return self.user.get_username()

class Vehicle(models.Model):
    name = models.CharField(max_length=30)
    fuel = models.ForeignKey(FuelType, on_delete = models.CASCADE, help_text = 'Select a fuel type for this vehicle.')
    economy = models.FloatField()
    owner = models.ForeignKey(Profile, on_delete=models.CASCADE)
    economy_metric = models.ForeignKey(EconomyMetric, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.name}'