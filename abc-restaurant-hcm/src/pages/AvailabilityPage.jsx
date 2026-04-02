import AvailabilityEditor from '../components/employee/AvailabilityEditor';

const AvailabilityPage = () => {
  return (
    <div className="container" style={{ paddingTop: 10 }}>
      <div>
        <h1 className="pageTitle">My Availability</h1>
        <p className="subtle">Set your weekly availability schedule. Managers use this when creating shifts.</p>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <AvailabilityEditor />
      </div>
    </div>
  );
};

export default AvailabilityPage;
