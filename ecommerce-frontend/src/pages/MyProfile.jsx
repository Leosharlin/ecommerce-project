import { useMemo, useState } from "react";

const PROFILE_KEY = "profile_info";
const ADDRESS_KEY = "user_addresses";

function getStoredProfile() {
  const name = localStorage.getItem("name") || "";
  const [firstName = "", ...rest] = name.split(" ");

  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) {
      return {
        firstName,
        lastName: rest.join(" "),
        gender: "male",
        email: "",
        mobile: "",
      };
    }

    const parsed = JSON.parse(raw);
    return {
      firstName: parsed.firstName || firstName,
      lastName: parsed.lastName || rest.join(" "),
      gender: parsed.gender || "male",
      email: parsed.email || "",
      mobile: parsed.mobile || "",
    };
  } catch {
    return {
      firstName,
      lastName: rest.join(" "),
      gender: "male",
      email: "",
      mobile: "",
    };
  }
}

function getStoredAddresses() {
  try {
    const raw = localStorage.getItem(ADDRESS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function MyProfile() {
  const [profile, setProfile] = useState(getStoredProfile);
  const [addresses, setAddresses] = useState(getStoredAddresses);
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingMobile, setEditingMobile] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    addressType: "Home",
    doorBlock: "",
    line: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    landmark: "",
    alternatePhone: "",
  });
  const [editingId, setEditingId] = useState(null);

  const hasAddress = useMemo(() => addresses.length > 0, [addresses]);

  const inputClass = (editable) =>
    `w-full border border-gray-300 rounded p-3 ${
      editable
        ? "bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500"
        : "bg-gray-100 text-gray-500 cursor-not-allowed"
    }`;

  const persistProfile = (nextProfile) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(nextProfile));
    const fullName = `${nextProfile.firstName} ${nextProfile.lastName}`.trim();
    if (fullName) {
      localStorage.setItem("name", fullName);
    }
  };

  const savePersonal = () => {
    persistProfile(profile);
    setEditingPersonal(false);
  };

  const saveEmail = () => {
    persistProfile(profile);
    setEditingEmail(false);
  };

  const saveMobile = () => {
    persistProfile(profile);
    setEditingMobile(false);
  };

  const resetForm = () => {
    setForm({
      name: "",
      addressType: "Home",
      doorBlock: "",
      line: "",
      city: "",
      state: "",
      pincode: "",
      phone: "",
      landmark: "",
      alternatePhone: "",
    });
    setEditingId(null);
  };
  const saveAddress = (e) => {
    e.preventDefault();

    let next;
    if (editingId) {
      next = addresses.map((a) =>
        a.id === editingId ? { ...form, id: editingId } : a
      );
    } else {
      next = [...addresses, { ...form, id: `addr-${Date.now()}` }];
    }

    setAddresses(next);
    localStorage.setItem(ADDRESS_KEY, JSON.stringify(next));
    resetForm();
    setShowAddressForm(false);
  };

  const editAddress = (id) => {
    const target = addresses.find((a) => a.id === id);
    if (!target) return;
    setForm({
      name: target.name || "",
      addressType: target.addressType || "Home",
      doorBlock: target.doorBlock || "",
      line: target.line || "",
      city: target.city || "",
      state: target.state || "",
      pincode: target.pincode || "",
      phone: target.phone || "",
      landmark: target.landmark || "",
      alternatePhone: target.alternatePhone || "",
    });
    setEditingId(id);
    setShowAddressForm(true);
  };

  const deleteAddress = (id) => {
    const next = addresses.filter((a) => a.id !== id);
    setAddresses(next);
    localStorage.setItem(ADDRESS_KEY, JSON.stringify(next));
    if (editingId === id) {
      resetForm();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="bg-white border border-gray-200 rounded p-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
          </div>

          <div className="mt-8">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
              <button
                onClick={() => (editingPersonal ? savePersonal() : setEditingPersonal(true))}
                className="text-black font-semibold"
              >
                {editingPersonal ? "Save" : "Edit"}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                className={inputClass(editingPersonal)}
                value={profile.firstName}
                readOnly={!editingPersonal}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, firstName: e.target.value }))
                }
              />
              <input
                type="text"
                className={inputClass(editingPersonal)}
                value={profile.lastName}
                readOnly={!editingPersonal}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, lastName: e.target.value }))
                }
              />
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-900 mb-2 text-left">Your Gender</p>
              <div className="flex items-center gap-6 text-gray-700">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={profile.gender === "male"}
                    disabled={!editingPersonal}
                    onChange={() => setProfile((p) => ({ ...p, gender: "male" }))}
                  />
                  Male
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={profile.gender === "female"}
                    disabled={!editingPersonal}
                    onChange={() =>
                      setProfile((p) => ({ ...p, gender: "female" }))
                    }
                  />
                  Female
                </label>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">Email Address</h2>
              <button
                onClick={() => (editingEmail ? saveEmail() : setEditingEmail(true))}
                className="text-black font-semibold"
              >
                {editingEmail ? "Save" : "Edit"}
              </button>
            </div>
            <div className="mt-4 max-w-md">
              <input
                type="email"
                className={inputClass(editingEmail)}
                value={profile.email}
                readOnly={!editingEmail}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
          </div>

          <div className="mt-10">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">Mobile Number</h2>
              <button
                onClick={() => (editingMobile ? saveMobile() : setEditingMobile(true))}
                className="text-black font-semibold"
              >
                {editingMobile ? "Save" : "Edit"}
              </button>
            </div>
            <div className="mt-4 max-w-md">
              <input
                type="text"
                className={inputClass(editingMobile)}
                value={profile.mobile}
                readOnly={!editingMobile}
                onChange={(e) => setProfile((p) => ({ ...p, mobile: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <div id="addresses" className="bg-white border border-gray-200 rounded p-6">
          <h2 className="text-2xl font-semibold text-gray-900">Manage Addresses</h2>

          <button
            onClick={() => {
              if (!showAddressForm) resetForm();
              setShowAddressForm(true);
            }}
            className="mt-6 w-full border border-gray-300 rounded px-5 py-5 text-left text-black font-semibold text-sm hover:bg-gray-50"
          >
            + ADD A NEW ADDRESS
          </button>

          {showAddressForm && (
            <>
              <form className="mt-6 border border-gray-300 bg-gray-50 p-6 text-left" onSubmit={saveAddress}>
                <p className="text-black font-semibold text-sm mb-4 text-left">ADD A NEW ADDRESS</p>
                <button
                  type="button"
                  className="mb-5 px-5 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 inline-flex items-center justify-start"
                >
                  Use my current location
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Name"
                  className="border border-gray-300 rounded p-3 bg-white"
                  value={form.name}
                  required
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="10-digit mobile number"
                  className="border border-gray-300 rounded p-3 bg-white"
                  value={form.phone}
                  required
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  className="border border-gray-300 rounded p-3 bg-white"
                  value={form.pincode}
                  required
                  onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Door No / Block No"
                  className="border border-gray-300 rounded p-3 bg-white"
                  value={form.doorBlock}
                  required
                  onChange={(e) => setForm((f) => ({ ...f, doorBlock: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Address (Area and Street)"
                  className="border border-gray-300 rounded p-3 md:col-span-2 bg-white"
                  value={form.line}
                  required
                  onChange={(e) => setForm((f) => ({ ...f, line: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="City / District / Town"
                  className="border border-gray-300 rounded p-3 bg-white"
                  value={form.city}
                  required
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                />
                <select
                  className="border border-gray-300 rounded p-3 bg-white"
                  value={form.state}
                  required
                  onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                >
                  <option value="">--Select State--</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Telangana">Telangana</option>
                </select>
                <input
                  type="text"
                  placeholder="Landmark (Optional)"
                  className="border border-gray-300 rounded p-3 bg-white"
                  value={form.landmark}
                  onChange={(e) => setForm((f) => ({ ...f, landmark: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Alternate Phone (Optional)"
                  className="border border-gray-300 rounded p-3 bg-white"
                  value={form.alternatePhone}
                  onChange={(e) => setForm((f) => ({ ...f, alternatePhone: e.target.value }))}
                />
                </div>

                <div className="mt-5">
                  <p className="text-sm text-gray-600 mb-2 text-left">Address Type</p>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={form.addressType === "Home"}
                        onChange={() => setForm((f) => ({ ...f, addressType: "Home" }))}
                      />
                      Home
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={form.addressType === "Work"}
                        onChange={() => setForm((f) => ({ ...f, addressType: "Work" }))}
                      />
                      Work
                    </label>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-black text-white rounded hover:bg-gray-800"
                >
                  {editingId ? "Update Address" : "Save Address"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowAddressForm(false);
                  }}
                  className="px-5 py-2 text-black font-semibold rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
              </form>
            </>
          )}

          <div className="mt-8 border border-gray-200 text-left">
            {addresses.map((a) => (
              <div
                key={a.id}
                className="px-6 py-6 border-b border-gray-200 last:border-b-0 flex items-start justify-between gap-4 text-left"
              >
                <div>
                  <p className="inline-block px-2 py-1 bg-gray-100 text-xs font-semibold uppercase text-gray-500 rounded">
                    {a.addressType || "Home"}
                  </p>
                  <p className="text-sm text-gray-900 mt-3 font-semibold">
                    {a.name || `${profile.firstName || "User"} ${profile.lastName || ""}`.trim()}{" "}
                    <span className="font-semibold">{a.phone || profile.mobile || ""}</span>
                  </p>
                  <p className="text-sm text-gray-800 mt-2">
                    {[a.doorBlock, a.line, a.city, a.state].filter(Boolean).join(", ")}
                    {a.pincode ? <> - <span className="font-semibold">{a.pincode}</span></> : null}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => editAddress(a.id)}
                    className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteAddress(a.id)}
                    className="px-3 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {!hasAddress && (
              <div className="px-6 py-8 text-sm text-gray-500">No address saved</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyProfile;
