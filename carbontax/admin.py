from django.contrib import admin
from .models import FuelType, EmissionInstance, Profile, Vehicle, EconomyMetric

# Register your models here.
@admin.register(FuelType)
class FuelTypeAdmin(admin.ModelAdmin):
    list_display = ('name','unit','co2_per_unit')

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    pass

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('name','owner','fuel','economy')

@admin.register(EconomyMetric)
class EconomyMetricAdmin(admin.ModelAdmin):
    pass

@admin.register(EmissionInstance)
class EmissionInstanceAdmin(admin.ModelAdmin):
    list_display = ('name','date','travel_mode','distance','co2_output_kg','price')