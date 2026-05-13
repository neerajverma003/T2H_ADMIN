import { useParams } from "react-router-dom";
import HoneymoonResortForm from "../../pages/resorts/CreateResort";

const ViewPage = () => {
  const { id } = useParams();

  // Render the honeymoon form in view mode
  return <HoneymoonResortForm editId={id} isViewMode={true} />;
};

export default ViewPage;
