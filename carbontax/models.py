from django.db import models
from django.contrib.auth.models import User

class EmissionInstance(models.Model):
    """
    Created when an entry is created from inputs.
    """
    name = models.CharField(max_length=60, null=True)
    date = models.DateField(null=True)
    travel_mode = models.CharField(max_length=30, null=True)
    distance = models.FloatField(null=True)
    co2_output_kg = models.FloatField(null=True)
    price = models.FloatField(null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='emissions', null=True)

    class Meta:
        ordering = ["-date", "-id"]

    def __str__(self):
        return f'{self.date}-{self.name}'

class FuelType(models.Model):
    name = models.CharField(max_length=30, unique=True)
    unit = models.CharField(max_length=30)
    co2_per_unit = models.FloatField()

    def __str__(self):
        """String for representing the Model object."""
        return f'{self.name}'

class EconomyMetric(models.Model):
    name = models.CharField(max_length=30)

    def __str__(self):
        return self.name

class TaxRate(models.Model):
    name = models.CharField(max_length=30)
    price_per_kg = models.FloatField(default=0)
    category = models.CharField(max_length=30, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='taxes', null=True)
    isDefault = models.BooleanField(default=False)
    usage = models.IntegerField(default=0)

    class Meta:
        ordering = ["category", "-usage", "id"]
        unique_together = ["name", "user", "category"]

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    location = models.CharField(max_length=60, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)

    def __str__(self):
        """String for representing the Model object."""
        return f'{self.user.get_username()}, {self.location}'



class Vehicle(models.Model):
    name = models.CharField(max_length=30)
    fuel = models.ForeignKey(FuelType, on_delete = models.CASCADE, help_text = 'Select a fuel type for this vehicle.')
    economy = models.FloatField() # MUST BE IN L/100km
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='vehicles')

    
    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f'{self.name}'





