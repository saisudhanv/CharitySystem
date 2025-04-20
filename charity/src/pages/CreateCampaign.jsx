import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../utils/axios";
import { AuthContext } from "../context/AuthContext";

const CampaignDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [campaign, setCampaign] = useState(null);
  const [donation, setDonation] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const res = await API.get(`/campaigns/${id}`);
        setCampaign(res.data);
        setForm(res.data);
      } catch {
        alert("Error loading campaign");
      }
    };
    fetchCampaign();
  }, [id]);

  const isOwner = user?.id === campaign?.user;
  const isAdmin = user?.role === "admin";

  const handleDelete = async () => {
    if (window.confirm("Delete this campaign?")) {
      await API.delete(`/campaigns/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      navigate("/dashboard");
    }
  };

  const handleUpdate = async () => {
    await API.put(`/campaigns/${id}`, form, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    setEditMode(false);
    setCampaign({ ...campaign, ...form });
  };

  const handleDonation = async () => {
    await API.post(`/donations/${id}`, { amount: donation }, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    alert("Donation successful!");
    setDonation("");
  };

  if (!campaign) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      {editMode ? (
        <>
          <input
            name="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full mb-3 px-4 py-2 border rounded"
          />
          <textarea
            name="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full mb-3 px-4 py-2 border rounded"
          />
          <input
            name="targetAmount"
            type="number"
            value={form.targetAmount}
            onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
            className="w-full mb-3 px-4 py-2 border rounded"
          />
          <input
            name="endDate"
            type="date"
            value={form.endDate?.slice(0, 10)}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className="w-full mb-3 px-4 py-2 border rounded"
          />
          <button onClick={handleUpdate} className="bg-green-600 text-white px-4 py-2 rounded">
            Save
          </button>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-2">{campaign.title}</h2>
          <p className="mb-3">{campaign.description}</p>
          <img src={campaign.image} alt="Campaign" className="w-full rounded mb-4" />
          <p><strong>Target:</strong> ₹{campaign.targetAmount}</p>
          <p><strong>End Date:</strong> {new Date(campaign.endDate).toLocaleDateString()}</p>
        </>
      )}

      {(isOwner || isAdmin) && !editMode && (
        <div className="flex gap-4 mt-4">
          <button onClick={() => setEditMode(true)} className="bg-yellow-500 text-white px-4 py-2 rounded">
            Edit
          </button>
          <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">
            Delete
          </button>
        </div>
      )}

      {!isAdmin && !isOwner && (
        <div className="mt-6">
          <input
            type="number"
            value={donation}
            onChange={(e) => setDonation(e.target.value)}
            placeholder="Enter donation amount"
            className="w-full px-4 py-2 border rounded mb-2"
          />
          <button onClick={handleDonation} className="w-full bg-blue-600 text-white py-2 rounded">
            Donate
          </button>
        </div>
      )}
    </div>
  );
};

export default CampaignDetail;
