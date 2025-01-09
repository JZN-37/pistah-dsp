"use client";

import { Ad } from "@/types/interface";
import React, { useEffect, useState } from "react";
import CreateCreativeModal from "./CreateCreativeModal";
// import { CreativeData } from "../../../types/creativeTypeFile";
// import BookInventoryModal from "./BookInventoryModal";

type CreateAndBookCreativeModalProps = {
  onClose: () => void;
};

const CreateAndBookCreativeModal: React.FC<CreateAndBookCreativeModalProps> = ({
  onClose,
}) => {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(true);
  const [creativeData, setCreativeData] = useState<Ad>({
    id: "",
    title: "",
    downloadLink: "",
    createdBy: "",
    thumbnailUrl: "",
    thumbnailFile: undefined,
    duration: 0,
  });

  useEffect(() => {
    if (!showCreateModal && !showBookingModal) {
      onClose();
    }
  }, [showCreateModal, showBookingModal]);

  const handleCreativeCreated = (newCreativeData: typeof creativeData) => {
    setCreativeData(newCreativeData);
    setShowCreateModal(false);
    setShowBookingModal(true);
  };

  const handleBookingModalClose = () => {
    setShowBookingModal(false);
  };

  const handleCreateModalClose = () => {
    setShowCreateModal(false);
  };

  return (
    <>
      {showBookingModal && (
        // <BookInventoryModal
        //   onClose={handleBookingModalClose}
        //   inventoryId={""}
        //   creativeId={creativeData.creativeId}
        // />
        <></>
      )}
      {showCreateModal && (
        <CreateCreativeModal
          onClose={handleCreateModalClose}
          onCreativeCreated={handleCreativeCreated}
        />
      )}
    </>
  );
};

export default CreateAndBookCreativeModal;
