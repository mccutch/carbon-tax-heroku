# Generated by Django 3.0.5 on 2020-05-31 20:18

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('carbontax', '0032_auto_20200531_2017'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='emissioninstance',
            options={'ordering': ['-date', '-id']},
        ),
    ]