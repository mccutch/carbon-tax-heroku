# Generated by Django 3.0.5 on 2020-06-04 18:48

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('carbontax', '0036_auto_20200602_1835'),
    ]

    operations = [
        migrations.RenameField(
            model_name='emissioninstance',
            old_name='travel_mode',
            new_name='tax_type',
        ),
    ]
