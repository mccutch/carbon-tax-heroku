# Generated by Django 3.0.5 on 2020-07-23 22:14

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('carbontax', '0052_auto_20200723_1956'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='payment',
            options={'ordering': ['-date', 'id']},
        ),
    ]