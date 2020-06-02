from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    Modified from: https://www.django-rest-framework.org/tutorial/4-authentication-and-permissions/
    """

    def has_object_permission(self, request, view, obj):
        # Write/read permissions are only allowed to the owner of the object.
        print(f'Request user:{request.user}')
        print(f'obj.user:{obj.user}')
        print(f'Object:{obj}')
        if(obj.user):
            return obj.user == request.user
        elif(obj.owner):
            return obj.owner == request.user
        else:
            print(f'Request user:{request.user}')
            print(f'Object:{obj}')
            return False