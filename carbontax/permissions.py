from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    Modified from: https://www.django-rest-framework.org/tutorial/4-authentication-and-permissions/
    """

    def has_object_permission(self, request, view, obj):
        # Write/read permissions are only allowed to the owner of the object.
        
        try:
            # Most models have been named with an attribute "user"
            return obj.user == request.user
        except:
            pass

        try:
            # Models should have an attribute "owner"
            return obj.owner == request.user
        except:
            # For the case where object is the user itself
            return obj == request.user

        