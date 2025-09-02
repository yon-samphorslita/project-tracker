<template>
    <div class="noti-container">
        <div class="noti-header">
            <div>
                <div>
                    Notification
                </div>
                <div>
                    Mark all as read
                </div>
            </div>
            <div>
                <div>All Notification</div>
                <div>Unread</div>
            </div>

        </div>

        <!-- message -->
        <div>
            <div class="noti-profile">
                <img :src="profile"  alt="Profile Image">
            </div>
            <div>
                <div class="">{{ message.title }}</div>
                <div>{{ message.hour }}</div>
            </div>
        </div>

        <div style="font-weight: bold;">
            View all notifications
        </div>
    </div>
</template>

<script setup>

</script>

<style>
.noti-container{
    width: 300px;
    height: 500px;
    display: flex;
    flex-direction: column;

}

.noti-profile {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 10px;
}
.noti-profile img{
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>