# Generated by Django 3.0.5 on 2020-05-21 16:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('carbontax', '0017_auto_20200521_0358'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='taxes',
            field=models.ManyToManyField(to='carbontax.TaxRate'),
        ),
    ]
