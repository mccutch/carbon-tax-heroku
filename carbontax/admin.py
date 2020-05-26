from django.contrib import admin
from .models import FuelType, EmissionInstance, Profile, Vehicle, EconomyMetric, TaxRate

# Register your models here.
@admin.register(FuelType)
class FuelTypeAdmin(admin.ModelAdmin):
    list_display = ('name','unit','co2_per_unit')

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'date_of_birth', 'location')

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('name','owner','fuel','economy')

@admin.register(EconomyMetric)
class EconomyMetricAdmin(admin.ModelAdmin):
    pass

@admin.register(EmissionInstance)
class EmissionInstanceAdmin(admin.ModelAdmin):
    list_display = ('name','date','travel_mode','distance','co2_output_kg','price','user')

@admin.register(TaxRate)
class TaxRateAdmin(admin.ModelAdmin):
    list_display = ('name', 'price_per_kg', 'category', 'user')