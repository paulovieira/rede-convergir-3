## Users

What is a 'user'? 

- the unique identifier is the email address
- it is created automatically when a new initiative is approved
- the email address of the new initiative is the one used to create the user
- when it is created, it will have a random unknown password - the person must reset it using the 'reset password' page (or acessing the 'reset link' that is sent directly when the initiative is approved)

Here is the flow:

1) the initiative is submitted; it is in pending status; the user has not been created yet

2) the initiative is approved; the user will be created (upsert)

    id
    email - the email of the initiative (must be unique)
    created_at
    updated_at    
    password - when creating a new, use some random garbage
    recover_code

if the user already exists, no nothing

3) in the initiatives table, add the foreign key

4) if the user is new, the email has a link to reset the password for this user (already showing the form that allows the user to reset it); if the user already exists, don't show the link


--

add