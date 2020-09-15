from django.db import models
from django.contrib.auth.models import User

class DonationRecipient(models.Model):
    name = models.CharField(max_length=60)
    country = models.CharField(max_length=60, null=True)
    website = models.CharField(max_length=200, null=True)
    donation_link = models.CharField(max_length=200, null=True)
    description = models.TextField(null=True)

    def __str__(self):
        return f'{self.name}'

class Payment(models.Model):
    amount = models.FloatField() # Store payments in the database currency
    recipient = models.ForeignKey(DonationRecipient, on_delete=models.SET_NULL, related_name='payments', null=True)
    date = models.DateField(null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')

    class Meta:
        ordering = ["-date", "-id"]

    def __str__(self):
        return f'{self.date}-{self.recipient.name}-{self.amount}'

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
    loc_lat = models.DecimalField(max_digits=16, decimal_places=10, blank=True, null=True)
    loc_lng = models.DecimalField(max_digits=16, decimal_places=10, blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    currency = models.CharField(max_length=10, default="AUD")
    currency_symbol = models.CharField(max_length=10, default="$")
    conversion_factor = models.FloatField(default=1)
    display_units = models.CharField(max_length=10, default="lPer100Km")
    recipients = models.ManyToManyField(DonationRecipient, related_name="users", blank=True)

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

class EmissionInstance(models.Model):
    """
    Created when an entry is created from inputs.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='emissions', null=True)
    name = models.CharField(max_length=60, null=True)
    date = models.DateField(null=True)
    distance = models.FloatField(null=True)
    fuel = models.ForeignKey(FuelType, on_delete = models.SET_DEFAULT, default=1, null=True)
    economy = models.FloatField(default=10)
    split = models.FloatField(default=1)
    co2_output_kg = models.FloatField(null=True)
    tax_type = models.ForeignKey(TaxRate, on_delete=models.SET_NULL, related_name='emissions', null=True)
    price = models.FloatField(null=True)
    payment = models.ForeignKey(Payment, on_delete=models.SET_NULL, related_name='emissions', null=True)
    format_encoding = models.IntegerField(default=0)
    offset = models.FloatField(default=0)
    
    class Meta:
        ordering = ["-date", "-id"]

    def __str__(self):
        return f'{self.date}-{self.name}'





