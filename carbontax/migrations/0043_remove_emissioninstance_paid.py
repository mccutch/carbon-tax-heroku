# Generated by Django 3.0.5 on 2020-06-16 21:51

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('carbontax', '0042_payment_currency'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='emissioninstance',
            name='paid',
        ),
    ]
