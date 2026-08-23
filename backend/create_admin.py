import asyncio
from getpass import getpass
from datetime import datetime, timezone

from app.auth.crud import (
    create_user,
    get_user_by_email,
)

from app.auth.schema import UserRole
from app.auth.security import hash_password


async def main():

    print("\n========================================")
    print(" Smart Coffee Manufacturing")
    print(" Create Initial Administrator")
    print("========================================\n")

    first_name = input(
        "First name: "
    ).strip()

    last_name = input(
        "Last name: "
    ).strip()

    email = input(
        "Admin email: "
    ).strip().lower()

    # -----------------------------------------------------
    # CHECK REQUIRED FIELDS
    # -----------------------------------------------------

    if not first_name or not last_name or not email:
        print("\nError: All fields are required.")
        return

    # -----------------------------------------------------
    # CHECK EXISTING USER
    # -----------------------------------------------------

    existing_user = await get_user_by_email(
        email
    )

    if existing_user:
        print(
            "\nError: A user with this email already exists."
        )
        return

    # -----------------------------------------------------
    # PASSWORD
    # -----------------------------------------------------

    password = getpass(
        "Password: "
    )

    confirm_password = getpass(
        "Confirm password: "
    )

    if password != confirm_password:
        print(
            "\nError: Passwords do not match."
        )
        return

    if len(password) < 8:
        print(
            "\nError: Password must contain at least 8 characters."
        )
        return

    # -----------------------------------------------------
    # HASH PASSWORD
    # -----------------------------------------------------

    hashed_password = hash_password(
        password
    )

    now = datetime.now(
        timezone.utc
    )

    # -----------------------------------------------------
    # CREATE ADMIN DOCUMENT
    # -----------------------------------------------------

    admin_data = {
        "first_name": first_name,
        "last_name": last_name,

        "email": email,

        "password_hash": hashed_password,

        "requested_role": UserRole.ADMIN.value,
        "role": UserRole.ADMIN.value,

        "is_active": True,
        "is_approved": True,

        "created_at": now,
        "updated_at": now,

        "last_login": None,
    }

    admin = await create_user(
        admin_data
    )

    print("\n========================================")
    print(" Administrator created successfully")
    print("========================================")

    print(
        f"Admin ID: {admin['_id']}"
    )

    print(
        f"Email: {admin['email']}"
    )

    print(
        f"Role: {admin['role']}"
    )

    print("========================================\n")


if __name__ == "__main__":
    asyncio.run(main())