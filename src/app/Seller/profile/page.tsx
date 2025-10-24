import React from "react";

const ProfilePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
      {/* App Bar */}
      <div className="w-full max-w-md px-4 flex items-center mb-8">
        {/* Optional Back Button
        <button className="mr-2 text-2xl">{'<'}</button>
        */}
        <h1 className="text-2xl font-semibold text-gray-900 mx-auto">Profile</h1>
      </div>

      {/* Profile Info */}
      <div className="bg-white shadow rounded-xl w-full max-w-md px-6 py-8 flex flex-col items-center">
        <img
          className="w-24 h-24 rounded-full mb-4"
          src="/profile.png"
          alt="Profile"
        />
        <div className="text-xl font-medium text-gray-900">Danial Kushairi</div>
        <div className="text-gray-500 text-sm mb-6">dkushairi@email.com</div>

        {/* Personal Information Section */}
        <div className="w-full mb-4">
          <div className="text-xs font-semibold text-gray-500 mb-2">Personal Information</div>
          <button className="w-full py-3 flex justify-between items-center border-b border-gray-200">
            <span>Email Address</span>
            <span className="text-gray-400">{'>'}</span>
          </button>
          <button className="w-full py-3 flex justify-between items-center">
            <span>Name</span>
            <span className="text-gray-400">{'>'}</span>
          </button>
        </div>

        {/* Security Section */}
        <div className="w-full mb-8">
          <div className="text-xs font-semibold text-gray-500 mb-2">Security</div>
          <button className="w-full py-3 flex justify-between items-center">
            <span>Change Password</span>
            <span className="text-gray-400">{'>'}</span>
          </button>
        </div>

        {/* Account Actions */}
        <div className="w-full flex flex-col gap-2">
          <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold">
            Sign out
          </button>
          <button className="w-full py-3 border border-gray-300 rounded-lg text-blue-600 font-semibold">
            Switch Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
