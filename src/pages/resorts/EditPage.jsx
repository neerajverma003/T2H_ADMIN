import { useParams } from "react-router-dom";
import HoneymoonResortForm from "../../pages/resorts/CreateResort";

const EditPage = () => {
  const { id } = useParams();

  // Render the honeymoon form in edit mode
  return <HoneymoonResortForm editId={id} />;
};

export default EditPage;
